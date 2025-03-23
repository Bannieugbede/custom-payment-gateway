/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/permit.ts
import axios from "axios";

class PermitClient {
  private apiKey: string;
  private pdpUrl: string;
  private apiUrl: string;
  api: any;

  constructor(config: { apiKey: string; pdpUrl: string }) {
    this.apiKey = config.apiKey;
    this.pdpUrl = config.pdpUrl;
    this.apiUrl = "https://api.permit.io";
  }

  async assignRole(userId: string, role: string, tenant: string) {
    try {
      const response = await axios.post(
        `${this.apiUrl}/v2/facts/role_assignments`,
        {
          user: userId,
          role: role,
          tenant: tenant,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to assign role: ${error.response?.data?.detail || error.message}`);
    }
  }

  async check(userId: string, action: string, resource: { type: string; tenant: string }) {
    try {
      const response = await axios.post(
        `${this.pdpUrl}/v2/allowed`,
        {
          user: { key: userId },
          action: action,
          resource: resource,
        },
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.allow;
    } catch (error: any) {
      throw new Error(`Permission check failed: ${error.response?.data?.detail || error.message}`);
    }
  }
}

const permit = new PermitClient({
  apiKey: process.env.PERMIT_API_KEY!,
  pdpUrl: "https://cloudpdp.api.permit.io",
});

export default permit;