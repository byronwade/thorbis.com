// Placeholder Supabase client
export const supabase = {
  from: () => ({
    select: () => ({
      eq: () => ({
        then: (callback) => callback({ data: [], error: null })
      })
    })
  })
};
