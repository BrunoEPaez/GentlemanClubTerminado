import axios from 'axios';

const API_URL = 'http://localhost:3000'; // La dirección de tu servidor

export const getCourses = async () => {
  const response = await axios.get(`${API_URL}/courses`);
  return response.data;
};