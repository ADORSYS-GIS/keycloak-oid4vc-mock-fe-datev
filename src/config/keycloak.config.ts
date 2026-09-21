import Keycloak from 'keycloak-js';

export const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL,
  realm: import.meta.env.VITE_KEYCLOAK_REALM,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
};

export const germanPidImportProviderAlias =
  import.meta.env.VITE_GERMAN_PID_IMPORT_IDP_ALIAS || 'oid4vp-import';

export const keycloakAccountUrl = `${keycloakConfig.url.replace(/\/$/, '')}/realms/${encodeURIComponent(
  keycloakConfig.realm
)}/account/`;

const keycloak = new Keycloak(keycloakConfig);

keycloak.onAuthSuccess = () => {
  console.log('Authentication successful');
};

keycloak.onAuthError = (error) => {
  console.error('Authentication failed:', error);
};

keycloak.onAuthRefreshError = () => {
  console.error('Token refresh failed');
};

export default keycloak;
