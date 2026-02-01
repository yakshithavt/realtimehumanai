import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

class TeachingService {
  async startLesson(lessonData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/teaching/start-lesson`, lessonData);
      return response.data;
    } catch (error) {
      console.error('Error starting lesson:', error);
      return { success: false, error: error.message };
    }
  }

  async askQuestion(questionData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/teaching/ask-question`, questionData);
      return response.data;
    } catch (error) {
      console.error('Error asking question:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProgress(progressData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/teaching/update-progress`, progressData);
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      return { success: false, error: error.message };
    }
  }

  async getTopics() {
    try {
      const response = await axios.get(`${API_BASE_URL}/teaching/topics`);
      return response.data;
    } catch (error) {
      console.error('Error getting topics:', error);
      return { success: false, error: error.message };
    }
  }

  async getHealth() {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking health:', error);
      return { success: false, error: error.message };
    }
  }
}

export default new TeachingService();
