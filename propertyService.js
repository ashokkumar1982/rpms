import { supabase } from '../supabaseClient'

const TABLE = 'properties'

/**
 * Centralized service layer for all Property CRUD + query operations.
 * Every function returns { data, error } to keep call sites consistent.
 */
export const propertyService = {
  /**
   * Fetch a paginated, searchable, filterable list of properties
   * belonging to the currently signed-in user.
   */
  async list({ page = 1, pageSize = 10, search = '', status = '', propertyType = '' } = {}) {
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from(TABLE)
      .select('*', { count: 'exact' })
      .order('created_date', { ascending: false })
      .range(from, to)

    if (search) {
      // Search across name, number, city
      query = query.or(
        `property_name.ilike.%${search}%,property_number.ilike.%${search}%,city.ilike.%${search}%`
      )
    }
    if (status) query = query.eq('status', status)
    if (propertyType) query = query.eq('property_type', propertyType)

    const { data, error, count } = await query
    return { data, error, count }
  },

  async getById(propertyId) {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('property_id', propertyId)
      .single()
    return { data, error }
  },

  async create(payload, ownerId) {
    const { data, error } = await supabase
      .from(TABLE)
      .insert([{ ...payload, owner_id: ownerId }])
      .select()
      .single()
    return { data, error }
  },

  async update(propertyId, payload) {
    const { data, error } = await supabase
      .from(TABLE)
      .update(payload)
      .eq('property_id', propertyId)
      .select()
      .single()
    return { data, error }
  },

  async remove(propertyId) {
    const { error } = await supabase.from(TABLE).delete().eq('property_id', propertyId)
    return { error }
  },

  /** Quick counts used by dashboard cards (kept here so it's ready for the Dashboard module later) */
  async counts() {
    const { count: total } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
    const { count: occupied } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Occupied')
    const { count: vacant } = await supabase
      .from(TABLE)
      .select('*', { count: 'exact', head: true })
      .eq('status', 'Vacant')
    return { total: total || 0, occupied: occupied || 0, vacant: vacant || 0 }
  },
}
