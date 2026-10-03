// SITAMA-DEEP Supabase Integration Client
// SMK Negeri Wonosalam - GEMPITA 2026

(function () {
  // Config defaults: Bisa diisi langsung di bawah ini atau disimpan lewat Settings / LocalStorage
  const DEFAULT_SUPABASE_URL = "";
  const DEFAULT_SUPABASE_ANON_KEY = "";

  function normalizeUrl(url) {
    if (!url) return '';
    return url.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
  }

  const rawUrl = localStorage.getItem('sitama_supabase_url') || DEFAULT_SUPABASE_URL;
  const savedUrl = normalizeUrl(rawUrl);
  const savedKey = (localStorage.getItem('sitama_supabase_anon_key') || DEFAULT_SUPABASE_ANON_KEY).trim();

  let client = null;

  if (typeof supabase !== 'undefined' && savedUrl && savedKey) {
    try {
      client = supabase.createClient(savedUrl, savedKey);
      console.log('✅ [SITAMA-DEEP] Supabase Client Connected to:', savedUrl);
    } catch (e) {
      console.warn('⚠️ [SITAMA-DEEP] Gagal inisialisasi Supabase client:', e.message);
    }
  } else {
    console.log('ℹ️ [SITAMA-DEEP] Berjalan dalam Mode Lokal / Hybrid (LocalStorage). Masukkan Supabase URL & Anon Key untuk sinkronisasi cloud real-time.');
  }

  // Database Abstraction Layer (Hybrid: Supabase + LocalStorage Fallback)
  window.SitamaDB = {
    client: client,
    isCloudConnected: function () {
      return !!client;
    },
    getConfig: function () {
      return {
        url: localStorage.getItem('sitama_supabase_url') || '',
        key: localStorage.getItem('sitama_supabase_anon_key') || ''
      };
    },
    saveConfig: function (url, key) {
      const clean = normalizeUrl(url);
      localStorage.setItem('sitama_supabase_url', clean);
      localStorage.setItem('sitama_supabase_anon_key', (key || '').trim());
      location.reload();
    },

    // 1. Fetch Modules
    getModules: async function (fallbackData) {
      if (!client) return fallbackData;
      try {
        const { data, error } = await client
          .from('modules')
          .select('*, reviews(*), tendik_verifications(*)');
        if (error) throw error;
        if (data && data.length > 0) {
          // Format modules with nested reviews
          return data.map(m => ({
            ...m,
            review: m.reviews && m.reviews[0] ? m.reviews[0] : null,
            tendik_verification: m.tendik_verifications && m.tendik_verifications[0] ? m.tendik_verifications[0] : null
          }));
        }
        return fallbackData;
      } catch (err) {
        console.warn('Gagal ambil data Supabase, menggunakan lokal:', err.message);
        return fallbackData;
      }
    },

    // 2. Insert Module
    insertModule: async function (moduleObj) {
      if (client) {
        try {
          const { error } = await client.from('modules').insert([moduleObj]);
          if (error) console.error('Supabase insert module error:', error);
        } catch (e) {
          console.warn('Supabase offline, disimpan ke lokal:', e);
        }
      }
    },

    // 3. Save Review (Kepala Sekolah)
    saveReview: async function (reviewObj) {
      if (client) {
        try {
          const { error } = await client.from('reviews').insert([reviewObj]);
          if (error) console.error('Supabase save review error:', error);
          // Update module status
          await client.from('modules').update({
            status: reviewObj.status,
            reviewed_at: reviewObj.review_date
          }).eq('id', reviewObj.module_id);
        } catch (e) {
          console.warn('Supabase review error, fallback lokal:', e);
        }
      }
    },

    // 4. Save Tendik Verification
    saveTendikVerification: async function (verifObj) {
      if (client) {
        try {
          const { error } = await client.from('tendik_verifications').insert([verifObj]);
          if (error) console.error('Supabase tendik verification error:', error);
        } catch (e) {
          console.warn('Supabase tendik error, fallback lokal:', e);
        }
      }
    },

    // 5. Upload File PDF to Supabase Storage (Bucket: 'modules')
    uploadModuleFile: async function (file, path) {
      if (!client) return null;
      try {
        const { data, error } = await client.storage.from('modules').upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });
        if (error) throw error;
        const { data: publicUrlData } = client.storage.from('modules').getPublicUrl(path);
        return publicUrlData.publicUrl;
      } catch (err) {
        console.error('Gagal unggah file ke Supabase Storage:', err);
        return null;
      }
    }
  };
})();
