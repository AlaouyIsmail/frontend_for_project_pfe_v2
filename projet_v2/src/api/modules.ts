import api from './axios';

// ─── All routes match Flask app.py exactly ───────────────────────

// GET /me
export const meApi = {
  get: () => api.get('/me'),
  update: (id: number, data: FormData) => api.put(`/user/update/${id}`, data),
  delete: (id: number) => api.delete(`/user/delete/${id}`),
};

// GET /statistics  (RH only)
export const statsApi = {
  get: () => api.get('/statistics'),
};

// GET /dashboard/resources  (RH sees all chefs+resources, CHEF sees own team)
export const dashboardApi = {
  resources: () => api.get('/dashboard/resources'),
};

// POST /chef  (RH only, FormData)
export const chefApi = {
  create: (data: FormData) => api.post('/chef', data),
};

// POST /ressource  (RH or CHEF, FormData)
export const ressourceApi = {
  create: (data: FormData) => api.post('/ressource', data),
};

// Projects CRUD
export const projectsApi = {
  getAll:   ()                        => api.get('/projects'),
  getById:  (id: number)              => api.get(`/project/${id}`),
  create:   (data: FormData)          => api.post('/project/create', data),
  update:   (id: number, data: FormData) => api.put(`/project/update/${id}`, data),
  delete:   (id: number)              => api.delete(`/project/delete/${id}`),
};

// Users CRUD
export const usersApi = {
  update: (id: number, data: FormData) => api.put(`/user/update/${id}`, data),
  delete: (id: number)                 => api.delete(`/user/delete/${id}`),
};

// Tasks (CHEF only)
export const tasksApi = {
  create: (data: FormData) => api.post('/task/create', data),
};
