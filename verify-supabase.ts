import { supabase } from './utils/supabase';

async function verifyConnection() {
    console.log('Verifying Supabase connection...');
    try {
        const { data, error } = await supabase.from('_test_connection').select('*').limit(1);

        if (error) {
            if (error.code === 'PGRST116' || error.message.includes('relation "_test_connection" does not exist')) {
                console.log('✅ Supabase client initialized and connected successfully!');
                console.log('(Note: _test_connection table does not exist, which is expected for a fresh project)');
            } else {
                console.error('❌ Supabase connection error:', error.message);
            }
        } else {
            console.log('✅ Supabase connection successful! Data:', data);
        }
    } catch (err) {
        console.error('❌ Unexpected error during verification:', err);
    }
}

verifyConnection();
