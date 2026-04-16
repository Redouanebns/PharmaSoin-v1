export const TOKEN_KEY = 'pharma_auth_token';
export const USER_KEY = 'pharma_auth_user';

export const roleLabels = {
  admin: 'Administrateur',
  pharmacien: 'Pharmacien',
  client: 'Client',
};

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch (error) {
    console.error('Impossible de lire l’utilisateur stocké.', error);
    return null;
  }
};

export const setAuthSession = (token, user) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const getRoleLabel = (role) => roleLabels[role] || 'Utilisateur';

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

export const resolveDefaultRoute = (user) => {
  if (!user) {
    return '/';
  }

  return user.role === 'client' ? '/client-dashboard' : '/dashboard/stats';
};
