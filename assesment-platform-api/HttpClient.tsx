
// Define a generic interface for the API response structure
interface ApiResponse<T> {
  data: T | null;
  status: number;
  message: string;
  success: boolean;
}

// Define an interface for the HTTP client configuration
interface HttpClientConfig extends RequestInit {
  headers?: HeadersInit;
  // Add any other custom config properties if needed
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    config?: HttpClientConfig
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config?.headers,
    };

    const options: RequestInit = {
      method,
      headers,
      ...config,
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const responseData = await response.json();

      if (!response.ok) {
        return {
          data: null,
          status: response.status,
          message: responseData.message || 'An error occurred',
          success: false,
        };
      }

      return {
        data: responseData as T,
        status: response.status,
        message: responseData.message || 'Success',
        success: true,
      };
    } catch (error) {
      console.error(`HTTP Request Error (${method} ${url}):`, error);
      return {
        data: null,
        status: 500,
        message: (error as Error).message || 'Network error or unexpected issue',
        success: false,
      };
    }
  }

  public async get<T>(
    endpoint: string,
    config?: HttpClientConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, config);
  }

  public async post<T>(
    endpoint: string,
    data: any,
    config?: HttpClientConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, config);
  }

  public async put<T>(
    endpoint: string,
    data: any,
    config?: HttpClientConfig
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  // Specific helper for posting execution results
  public async postExecution<T>(
    endpoint: string,
    data: any,
    config?: HttpClientConfig
  ): Promise<ApiResponse<T>> {
    // You might add specific logic or headers here for execution requests
    return this.request<T>('POST', endpoint, data, config);
  }

  // Specific helper for getting execution solutions
  public async getExecutionSolution<T>(
    endpoint: string,
    config?: HttpClientConfig
  ): Promise<ApiResponse<T>> {
    // You might add specific logic or headers here for fetching solutions
    return this.request<T>('GET', endpoint, undefined, config);
  }
}

// Export a default instance for convenience
const httpClient = new HttpClient(process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api');

export default httpClient;
export { HttpClient, ApiResponse, HttpClientConfig };
