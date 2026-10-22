export interface ApiResponse<T = any> {
  data: T;
  status: number;
  durationMs: number;
  error?: string;
  message?: string;
}

class ApiClient {
  private getBaseUrl(): string {
    const customUrl = import.meta.env.VITE_API_URL;
    if (customUrl && typeof customUrl === 'string' && customUrl.trim()) {
      return customUrl.replace(/\/$/, '') + '/api';
    }
    return '/api';
  }

  private getToken(): string | null {
    return localStorage.getItem('taskflow_jwt');
  }

  public setToken(token: string | null) {
    if (token) {
      localStorage.setItem('taskflow_jwt', token);
    } else {
      localStorage.removeItem('taskflow_jwt');
    }
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.getBaseUrl()}${cleanEndpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const startTime = performance.now();
    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const durationMs = Math.round(performance.now() - startTime);
      let data: any = null;

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { message: text };
      }

      if (!response.ok) {
        return {
          data,
          status: response.status,
          durationMs,
          error: data?.error || `HTTP ${response.status}`,
          message: data?.message || 'Erreur lors de la requête API',
        };
      }

      return {
        data,
        status: response.status,
        durationMs,
      };
    } catch (err: any) {
      const durationMs = Math.round(performance.now() - startTime);
      return {
        data: null as any,
        status: 0,
        durationMs,
        error: 'NetworkError',
        message: err?.message || 'Impossible de contacter le serveur TaskFlow.',
      };
    }
  }

  public get<T = any>(endpoint: string, params?: Record<string, any>) {
    let query = '';
    if (params) {
      const filtered = Object.entries(params).filter(
        ([_, v]) => v !== undefined && v !== null && v !== ''
      );
      if (filtered.length > 0) {
        query =
          '?' +
          new URLSearchParams(
            filtered.map(([k, v]) => [k, String(v)])
          ).toString();
      }
    }
    return this.request<T>(`${endpoint}${query}`, { method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public patch<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
