import keycloak from '../config/keycloak.config';

interface CredentialOfferUriResponse {
  credential_offer_uri?: string;
  issuer?: string;
  nonce?: string;
}

interface CredentialOffer {
  credential_issuer?: string;
  [key: string]: unknown;
}

export const CredentialConfigurationId = {
  DATEV_COMPANY: 'DatevCompanyCredential',
} as const;

export const DEFAULT_CREDENTIAL_CONFIGURATION_ID =
  import.meta.env.VITE_OID4VC_DEFAULT_CREDENTIAL_CONFIGURATION_ID ||
  CredentialConfigurationId.DATEV_COMPANY;

const EndpointType = {
  KEYCLOAK_26_6_0: 'keycloak_26_6_0',
} as const;

type EndpointType = (typeof EndpointType)[keyof typeof EndpointType];

type QueryParams = Record<string, string | undefined>;

class Oid4vcService {
  private static readonly ENDPOINTS = {
    CREATE_CREDENTIAL_OFFER: '/protocol/oid4vc/create-credential-offer',
  };

  private getBaseUrl(): string {
    const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL;
    const realm = import.meta.env.VITE_KEYCLOAK_REALM;
    return `${keycloakUrl}/realms/${realm}`;
  }

  private async getAuthHeaders(): Promise<HeadersInit> {
    // Ensure token is fresh
    await keycloak.updateToken(5);

    return {
      Authorization: `Bearer ${keycloak.token}`,
      Accept: 'application/json',
    };
  }

  private getUsername(): string {
    return keycloak.tokenParsed?.preferred_username || '';
  }

  private buildQueryString(params: QueryParams): string {
    return new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined) as [string, string][]
    ).toString();
  }

  async getCredentialOfferUri(
    credentialConfigurationId: string = DEFAULT_CREDENTIAL_CONFIGURATION_ID
  ): Promise<string> {
    return this.getCredentialOfferUriKeycloak26_6_0(credentialConfigurationId);
  }

  private async getCredentialOfferUriKeycloak26_6_0(
    credentialConfigurationId: string
  ): Promise<string> {
    const queryParams: QueryParams = {
      credential_configuration_id: credentialConfigurationId,
      target_user: this.getUsername(),
      pre_authorized: 'false',
    };

    return this.fetchCredentialOfferUri(
      Oid4vcService.ENDPOINTS.CREATE_CREDENTIAL_OFFER,
      queryParams,
      EndpointType.KEYCLOAK_26_6_0
    );
  }

  private async fetchCredentialOfferUri(
    endpointPath: string,
    queryParams: QueryParams,
    endpointType: EndpointType
  ): Promise<string> {
    const headers = await this.getAuthHeaders();
    const queryString = this.buildQueryString(queryParams);
    const url = `${this.getBaseUrl()}${endpointPath}?${queryString}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`${endpointType} endpoint failed: ${response.statusText}`);
    }

    const data: string | CredentialOfferUriResponse = await response.json();

    if (typeof data === 'string') return data;
    if (data?.credential_offer_uri) return data.credential_offer_uri;

    if (data?.issuer && data?.nonce) {
      const base = data.issuer.replace(/\/$/, '');
      return `${base}/${data.nonce}`;
    }

    throw new Error(`Unexpected response from ${endpointType} endpoint`);
  }

  async fetchOffer(offerUrl: string): Promise<CredentialOffer> {
    const response = await fetch(offerUrl, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch offer: ${response.statusText}`);
    }

    return response.json();
  }

  buildOfferDeeplink(
    offer: CredentialOffer,
    offerUrl?: string,
    variant: 'uri' | 'json' = 'uri'
  ): string {
    try {
      if (variant === 'uri' && offerUrl) {
        const encoded = encodeURIComponent(offerUrl);
        return `openid-credential-offer://?credential_offer_uri=${encoded}`;
      }

      // JSON variant
      const normalized: CredentialOffer = { ...offer };

      if (!normalized.credential_issuer) {
        normalized.credential_issuer = this.getBaseUrl();
      }

      const payload = JSON.stringify(normalized);
      const encoded = encodeURIComponent(payload);

      return `openid-credential-offer://?credential_offer=${encoded}`;
    } catch (error) {
      console.error('Error building offer deeplink:', error);
      throw error;
    }
  }

  private blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getCredentialOfferPng(
    credentialConfigurationId: string = DEFAULT_CREDENTIAL_CONFIGURATION_ID
  ): Promise<Blob> {
    return this.getCredentialOfferPngKeycloak26_6_0(credentialConfigurationId);
  }

  private async getCredentialOfferPngKeycloak26_6_0(
    credentialConfigurationId: string
  ): Promise<Blob> {
    const queryParams: QueryParams = {
      credential_configuration_id: credentialConfigurationId,
      target_user: this.getUsername(),
      pre_authorized: 'false',
      type: 'qr-code',
    };

    return this.fetchCredentialOfferPng(
      Oid4vcService.ENDPOINTS.CREATE_CREDENTIAL_OFFER,
      queryParams,
      EndpointType.KEYCLOAK_26_6_0
    );
  }

  private async fetchCredentialOfferPng(
    endpointPath: string,
    queryParams: QueryParams,
    endpointType: EndpointType
  ): Promise<Blob> {
    const baseHeaders = await this.getAuthHeaders();

    const headers = {
      ...baseHeaders,
      Accept: 'image/png',
    };

    const queryString = this.buildQueryString(queryParams);
    const url = `${this.getBaseUrl()}${endpointPath}?${queryString}`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`${endpointType} QR endpoint failed: ${response.statusText}`);
    }

    return response.blob();
  }

  async getCredentialOfferQrDataUrl(
    credentialConfigurationId: string = DEFAULT_CREDENTIAL_CONFIGURATION_ID
  ): Promise<string> {
    try {
      const pngBlob = await this.getCredentialOfferPng(credentialConfigurationId);
      return this.blobToDataURL(pngBlob);
    } catch (error) {
      console.error('Failed to get QR code data URL:', error);
      throw error;
    }
  }

  async getCredentialOfferDeeplink(
    byReference: boolean = true,
    credentialConfigurationId: string = DEFAULT_CREDENTIAL_CONFIGURATION_ID
  ): Promise<string> {
    const offerUrl = await this.getCredentialOfferUri(credentialConfigurationId);

    if (byReference) {
      return this.buildOfferDeeplink({}, offerUrl, 'uri');
    }

    const offer = await this.fetchOffer(offerUrl);
    return this.buildOfferDeeplink(offer, offerUrl, 'json');
  }
}

export default new Oid4vcService();
