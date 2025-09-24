const getAuthToken = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }
  return localStorage.getItem("authToken");
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`/api/${endpoint}`, {
    ...options,
    headers,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(
      responseData.error || `HTTP error! status: ${response.status}`
    );
  }

  // The 'data' field is not always present, e.g. in login responses.
  // Return the whole payload if 'data' is not there.
  return responseData.data !== undefined ? responseData.data : responseData;
}

// Generic CRUD functions
const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T, U>(endpoint: string, body: U) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }),
  put: <T, U>(endpoint: string, body: U) =>
    request<T>(endpoint, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: "DELETE" }),
};

// --- AUTH ---
export const authApi = {
  adminLogin: (credentials: any) =>
    api.post<any, any>("auth/login", credentials),
  userLogin: (credentials: any) =>
    api.post<any, any>("auth/user-login", credentials),
  register: (userData: any) => api.post<any, any>("users", userData),
};

// Specific resource operations
export const movieSeriesApi = {
  getAll: () => api.get<any[]>("movieseries"),
  getOne: (id: string) => api.get<any>(`movieseries/${id}`),
  search: (query: string) =>
    api.get<any[]>(`movieseries/search?query=${query}`),
  create: (data: any) => api.post<any, any>("movieseries", data),
  update: (id: string, data: any) =>
    api.put<any, any>(`movieseries/${id}`, data),
  delete: (id: string) => api.delete<void>(`movieseries/${id}`),
};

export const countryEarningsApi = {
  getAll: () => api.get<any[]>("earnings/country"),
  getByMovie: (movieId: string) =>
    api.get<any[]>(`earnings/country/movie/${movieId}`),
  create: (data: any) => api.post<any, any>("earnings/country", data),
  update: (id: string, data: any) =>
    api.put<any, any>(`earnings/country/${id}`, data),
  delete: (id: string) => api.delete<void>(`earnings/country/${id}`),
};

export const topActorEarningsApi = {
  getAll: () => api.get<any[]>("actors/earnings"),
  getByMovie: (movieId: string) =>
    api.get<any[]>(`actors/earnings/movie/${movieId}`),
  create: (data: any) => api.post<any, any>("actors/earnings", data),
  update: (id: string, data: any) =>
    api.put<any, any>(`actors/earnings/${id}`, data),
  delete: (id: string) => api.delete<void>(`actors/earnings/${id}`),
};

export const castMasterApi = {
  getAll: () => api.get<any[]>("cast"),
  create: (data: any) => api.post<any, any>("cast", data),
  update: (id: string, data: any) => api.put<any, any>(`cast/${id}`, data),
  delete: (id: string) => api.delete<void>(`cast/${id}`),
};

export const usersApi = {
  getAll: () => api.get<any[]>("users"),
  getLeaderboard: () => api.get<any[]>("users/leaderboard"),
  getOne: (id: string) => api.get<any>(`users/${id}`),
  create: (data: any) => api.post<any, any>("users", data),
  update: (id: string, data: any) => api.put<any, any>(`users/${id}`, data),
  updateUserAction: (data: {
    userId: string;
    movieId: string;
    actionType: "like" | "save" | "dislike";
  }) => api.post<any, any>("users/actions", data),
  removeUserAction: (data: {
    userId: string;
    movieId: string;
    actionType: "like" | "save" | "dislike";
  }) => api.post<any, any>("users/actions/remove", data),
  delete: (id: string) => api.delete<void>(`users/${id}`),
};

export const adminsApi = {
  getAll: () => api.get<any[]>("admins"),
  create: (data: any) => api.post<any, any>("admins", data),
  update: (id: string, data: any) => api.put<any, any>(`admins/${id}`, data),
  delete: (id: string) => api.delete<void>(`admins/${id}`),
};

export const quizApi = {
  getAll: () => api.get<any[]>("quizzes"),
  getOne: (id: string) => api.get<any>(`quizzes/${id}`),
  create: (data: any) => api.post<any, any>("quizzes", data),
  update: (id: string, data: any) => api.put<any, any>(`quizzes/${id}`, data),
  delete: (id: string) => api.delete<void>(`quizzes/${id}`),
  submit: (data: {
    quizId: string;
    userId: string;
    answers: (number | null)[];
  }) => api.post<any, any>("quizzes/submit", data),
};
