import { germanPidImportProviderAlias, keycloakAccountUrl } from '../config/keycloak.config';

interface LinkedAccount {
  connected?: boolean;
  providerAlias?: string;
}

const linkedAccountsUrl = new URL('linked-accounts', keycloakAccountUrl);
linkedAccountsUrl.searchParams.set('linked', 'true');
linkedAccountsUrl.searchParams.set('max', '100');

export async function isGermanPidImportedUser(accessToken: string): Promise<boolean> {
  const response = await fetch(linkedAccountsUrl, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to inspect linked accounts: HTTP ${response.status}`);
  }

  const linkedAccounts = (await response.json()) as LinkedAccount[];
  return linkedAccounts.some(
    (account) =>
      account.connected === true && account.providerAlias === germanPidImportProviderAlias
  );
}

export function redirectToKeycloakAccount(): void {
  window.location.replace(keycloakAccountUrl);
}
