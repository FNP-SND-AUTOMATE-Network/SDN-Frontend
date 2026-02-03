// Configuration Template Service สำหรับจัดการ API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export type TemplateType = "NETWORK" | "SECURITY" | "OTHER";

export interface RelatedTagInfoTemplate {
  id: string;
  tag_name: string;
  color?: string;
}

export interface TemplateDetail {
  id: string;
  config_content?: string | null;
  file_name?: string | null;
  file_size?: number;
  updated_at?: string;
}

export interface ConfigurationTemplate {
  id: string;
  template_name: string;
  description?: string | null;
  template_type: TemplateType;
  tag_name?: string | null;
  created_at: string;
  updated_at: string;
  tags?: RelatedTagInfoTemplate[];
  detail?: TemplateDetail | null;
  device_count?: number;
}

export interface ConfigurationTemplateListResponse {
  total: number;
  page: number;
  page_size: number;
  templates: ConfigurationTemplate[];
}

export interface ConfigurationTemplateCreate {
  template_name: string;
  description?: string | null;
  template_type?: TemplateType;
  tag_name?: string | null;
}

export interface ConfigurationTemplateUpdate {
  template_name?: string | null;
  description?: string | null;
  template_type?: TemplateType | null;
  tag_names?: string[] | null;
}

class ConfigurationTemplateService {
  private getHeaders(token: string) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  async getTemplates(
    token: string,
    page: number = 1,
    pageSize: number = 8,
    filters?: {
      template_type?: string;
      search?: string;
      tag_name?: string;
      include_usage?: boolean;
    },
  ): Promise<ConfigurationTemplateListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      page_size: pageSize.toString(),
    });

    if (filters?.template_type)
      params.append("template_type", filters.template_type);
    if (filters?.search) params.append("search", filters.search);
    if (filters?.tag_name) params.append("tag_name", filters.tag_name);
    if (filters?.include_usage) params.append("include_usage", "true");

    const response = await fetch(
      `${API_BASE_URL}/configuration-templates/?${params.toString()}`,
      {
        method: "GET",
        headers: this.getHeaders(token),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to fetch templates");
    }

    return response.json();
  }

  async getTemplate(
    token: string,
    templateId: string,
    includeUsage: boolean = false,
  ): Promise<ConfigurationTemplate> {
    const params = new URLSearchParams();
    if (includeUsage) params.append("include_usage", "true");

    const response = await fetch(
      `${API_BASE_URL}/configuration-templates/${templateId}?${params.toString()}`,
      {
        method: "GET",
        headers: this.getHeaders(token),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to fetch template");
    }

    return response.json();
  }

  /**
   * Create template - backend expects FormData with optional file/config_content
   */
  async createTemplate(
    token: string,
    data: ConfigurationTemplateCreate,
    content?: string | File,
  ): Promise<{ message: string; template: ConfigurationTemplate }> {
    const formData = new FormData();
    formData.append("template_name", data.template_name);
    if (data.description) {
      formData.append("description", data.description);
    }
    formData.append("template_type", data.template_type || "OTHER");
    if (data.tag_name) {
      formData.append("tag_name", data.tag_name);
    }

    // Add content if provided
    if (content) {
      if (content instanceof File) {
        formData.append("file", content);
      } else {
        formData.append("config_content", content);
      }
    }

    const response = await fetch(`${API_BASE_URL}/configuration-templates/`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // Don't set Content-Type - let browser set it with boundary for FormData
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create template");
    }

    return response.json();
  }

  async updateTemplate(
    token: string,
    templateId: string,
    data: ConfigurationTemplateUpdate,
  ): Promise<{ message: string; template: ConfigurationTemplate }> {
    const response = await fetch(
      `${API_BASE_URL}/configuration-templates/${templateId}`,
      {
        method: "PUT",
        headers: this.getHeaders(token),
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to update template");
    }

    return response.json();
  }

  async deleteTemplate(
    token: string,
    templateId: string,
    force: boolean = false,
  ): Promise<{ message: string }> {
    const params = new URLSearchParams();
    if (force) params.append("force", "true");

    const response = await fetch(
      `${API_BASE_URL}/configuration-templates/${templateId}?${params.toString()}`,
      {
        method: "DELETE",
        headers: this.getHeaders(token),
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to delete template");
    }

    return response.json();
  }

  /**
   * Upload content to a template - supports both file upload and text content
   */
  async uploadTemplateContent(
    token: string,
    templateId: string,
    content: string | File,
  ): Promise<{ message: string; template: ConfigurationTemplate }> {
    const formData = new FormData();

    if (content instanceof File) {
      formData.append("file", content);
    } else {
      // Create a text file from the content string
      const blob = new Blob([content], { type: "text/plain" });
      formData.append("file", blob, "config.txt");
    }

    const response = await fetch(
      `${API_BASE_URL}/configuration-templates/${templateId}/upload`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // Don't set Content-Type - let browser set it with boundary for FormData
        },
        body: formData,
      },
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to upload template content");
    }

    return response.json();
  }
}

export const configurationTemplateService = new ConfigurationTemplateService();
