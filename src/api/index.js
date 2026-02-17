/**
 * Punto de entrada de la capa API.
 * Importar: import { http, login, getUsers } from '@/api';  o  import http from '@/api';
 */
export { http, request } from './httpClient.js';
export { default } from './httpClient.js';
export { login } from './auth.js';
export { getUsers, getUserById, createUser } from './users.js';
export { getMemberships, updateMembership } from './memberships.js';
