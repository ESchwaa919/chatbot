const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parser');
const { createReadStream } = require('fs');

class VideoService {
  constructor() {
    this.videos = new Map();
    this.isLoaded = false;
    this.csvPath = process.env.SUMMARY_CSV_PATH || './summary.csv';
    this.summaryDir = process.env.SUMMARY_DIR || './summary';
  }

  async loadVideos() {
    if (this.isLoaded) {
      return;
    }

    try {
      const videos = await this.readCSV();
      this.videos.clear();
      
      videos.forEach(video => {
        this.videos.set(video.id.toString(), video);
      });
      
      this.isLoaded = true;
      console.log(`Loaded ${this.videos.size} videos from CSV`);
    } catch (error) {
      console.error('Error loading videos:', error);
      throw error;
    }
  }

  async readCSV() {
    return new Promise((resolve, reject) => {
      const results = [];
      
      createReadStream(this.csvPath)
        .pipe(csv({
          skipEmptyLines: true,
          skipLinesWithError: true
        }))
        .on('data', (data) => {
          // Clean up keys to handle BOM and extra whitespace
          const cleanData = {};
          Object.keys(data).forEach(key => {
            const cleanKey = key.replace(/^\uFEFF/, '').trim();
            cleanData[cleanKey] = data[key] ? data[key].trim() : null;
          });
          
          // Map CSV columns to our video object structure
          const video = {
            id: cleanData.ID || cleanData.id,
            name: cleanData.video_name || cleanData.name,
            summaryPath: cleanData.summary_path || cleanData.path,
            // Add any other fields from your CSV
            module: cleanData.module || null,
            year: cleanData.year || null,
            duration: cleanData.duration || null,
            instructor: cleanData.instructor || null
          };
          
          if (video.id && video.name && video.summaryPath) {
            results.push(video);
          }
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  async getVideoById(videoId) {
    await this.loadVideos();
    return this.videos.get(videoId.toString());
  }

  async getVideoSummary(videoId) {
    await this.loadVideos();
    
    const video = this.videos.get(videoId.toString());
    if (!video) {
      return null;
    }

    try {
      const summaryPath = path.resolve(video.summaryPath);
      const summary = await fs.readFile(summaryPath, 'utf8');
      return summary.trim();
    } catch (error) {
      console.error(`Error reading summary for video ${videoId}:`, error);
      return null;
    }
  }

  async getAllVideos() {
    await this.loadVideos();
    return Array.from(this.videos.values());
  }

  async searchVideos(query) {
    await this.loadVideos();
    
    const searchTerm = query.toLowerCase();
    const results = [];
    
    for (const video of this.videos.values()) {
      if (video.name.toLowerCase().includes(searchTerm) ||
          (video.instructor && video.instructor.toLowerCase().includes(searchTerm)) ||
          (video.module && video.module.toLowerCase().includes(searchTerm))) {
        results.push(video);
      }
    }
    
    return results;
  }

  async getVideosByModule(module) {
    await this.loadVideos();
    
    const results = [];
    for (const video of this.videos.values()) {
      if (video.module && video.module.toLowerCase() === module.toLowerCase()) {
        results.push(video);
      }
    }
    
    return results;
  }

  async getVideosByYear(year) {
    await this.loadVideos();
    
    const results = [];
    for (const video of this.videos.values()) {
      if (video.year && video.year.toString() === year.toString()) {
        results.push(video);
      }
    }
    
    return results;
  }

  async getVideosByInstructor(instructor) {
    await this.loadVideos();
    
    const searchTerm = instructor.toLowerCase();
    const results = [];
    
    for (const video of this.videos.values()) {
      if (video.instructor && video.instructor.toLowerCase().includes(searchTerm)) {
        results.push(video);
      }
    }
    
    return results;
  }

  // Get video statistics
  async getVideoStats() {
    await this.loadVideos();
    
    const stats = {
      totalVideos: this.videos.size,
      modules: new Set(),
      years: new Set(),
      instructors: new Set()
    };
    
    for (const video of this.videos.values()) {
      if (video.module) stats.modules.add(video.module);
      if (video.year) stats.years.add(video.year);
      if (video.instructor) stats.instructors.add(video.instructor);
    }
    
    return {
      totalVideos: stats.totalVideos,
      modules: Array.from(stats.modules),
      years: Array.from(stats.years),
      instructors: Array.from(stats.instructors)
    };
  }

  // Validate video data
  async validateVideoData() {
    await this.loadVideos();
    
    const issues = [];
    
    for (const video of this.videos.values()) {
      // Check if summary file exists
      try {
        const summaryPath = path.resolve(video.summaryPath);
        await fs.access(summaryPath);
      } catch (error) {
        issues.push({
          videoId: video.id,
          videoName: video.name,
          issue: 'Summary file not found',
          path: video.summaryPath
        });
      }
      
      // Check for required fields
      if (!video.name || video.name.trim() === '') {
        issues.push({
          videoId: video.id,
          issue: 'Missing video name'
        });
      }
    }
    
    return issues;
  }

  // Reload videos from CSV (useful for development)
  async reloadVideos() {
    this.isLoaded = false;
    await this.loadVideos();
  }

  // Get path mappings (for compatibility with original Python code)
  async getPathById(videoId) {
    const video = await this.getVideoById(videoId);
    return video ? video.summaryPath : null;
  }

  async getNameById(videoId) {
    const video = await this.getVideoById(videoId);
    return video ? video.name : null;
  }

  async getPathByName(videoName) {
    await this.loadVideos();
    
    for (const video of this.videos.values()) {
      if (video.name === videoName) {
        return video.summaryPath;
      }
    }
    
    return null;
  }
}

module.exports = { VideoService };