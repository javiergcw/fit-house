import { getCustomers as getCustomersApi, getCustomerById as getCustomerByIdApi, createCustomer as createCustomerApi, updateCustomer as updateCustomerApi, getCustomersLeft as getCustomersLeftApi } from '../api/customers.js';
import { fromApi as customerFromApi } from '../models/Customer.js';
import { fromApi as paginationFromApi } from '../models/Pagination.js';

/**
 * Servicio de customers. Encapsula la API de customers y normaliza con los modelos.
 */
export const CustomerService = {
  /**
   * Obtiene el listado paginado de customers.
   * @param {{ page?: number, limit?: number }} [params]
   * @returns {Promise<{ data: Array<object>, pagination: object }>}
   */
  async getCustomers(params = {}) {
    const result = await getCustomersApi(params);
    return {
      data: (result.data ?? []).map(customerFromApi).filter(Boolean),
      pagination: paginationFromApi(result.pagination),
    };
  },

  /**
   * Obtiene un customer por ID.
   * @param {string} id
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<object|null>} Customer normalizado o null
   */
  async getCustomerById(id, options = {}) {
    const apiCustomer = await getCustomerByIdApi(id, options);
    return customerFromApi(apiCustomer);
  },

  /**
   * Obtiene clientes dados de baja (GET /customers/left).
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<{ message: string, data: object[] }>}
   */
  async getLeft(options = {}) {
    const response = await getCustomersLeftApi(options);
    return {
      message: response.message ?? '',
      data: (response.data ?? []).map(customerFromApi).filter(Boolean),
    };
  },

  /**
   * Actualiza un customer (PUT /customers/:id).
   * @param {string} id
   * @param {object} payload - ej: { marked_as_left: true }
   * @returns {Promise<object|null>} Customer actualizado normalizado
   */
  async update(id, payload) {
    const apiCustomer = await updateCustomerApi(id, payload);
    return customerFromApi(apiCustomer);
  },

  /**
   * Crea un customer (POST /customers).
   * @param {object} payload - doc_type, doc_number, full_name, email, phone?, birth_date?, address?, status?
   * @returns {Promise<object|null>} Customer creado normalizado
   */
  async create(payload) {
    const apiCustomer = await createCustomerApi(payload);
    return customerFromApi(apiCustomer);
  },
};
