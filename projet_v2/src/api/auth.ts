import api from './axios';

// Flask /login uses FormData, returns { token }
// Flask /register uses FormData, returns { msg }
export const authApi = {
  login: (email: string, password: string) => {
    const fd = new FormData();
    fd.append('email', email);
    fd.append('password', password);
    return api.post('/login', fd);
  },
  register: (data: FormData) => api.post('/register', data),
};
