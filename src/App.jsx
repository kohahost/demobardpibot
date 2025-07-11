import React, { useState } from 'react';

// Impor utilitas dan komponen
import { getLockedBalances } from './lib/pi-network-utils'; // Pastikan path ke lib sudah benar
import { Toaster, toast } from 'sonner';
import { Card } from './components/ui/Card'; // Pastikan komponen UI ada di 'ui'

// --- PERUBAHAN UTAMA DI SINI ---
// Pastikan nama file di folder `src/components/` persis seperti ini (termasuk huruf besar/kecil):
// - LockedCoinsViewer.jsx
// - TransferForm.jsx
import LockedCoinsViewer from './components/LockedCoinsViewer';
import TransferForm from './components/TransferForm';


function App() {
  // State untuk mengelola tab yang aktif
  const [activeTab, setActiveTab] = useState('locked-coins');

  // State yang dibagikan antara komponen
  const [keyphrase, setKeyphrase] = useState("");
  const [claimables, setClaimables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk mengambil saldo, diteruskan ke LockedCoinsViewer
  const handleFetchBalances = async (event) => {
    event.preventDefault();
    if (!keyphrase) {
      return toast.error("Silakan masukkan frasa sandi dompet Anda.");
    }
    setIsLoading(true);
    try {
      // Menggunakan fungsi dari pi-network-utils.js
      const { balances } = await getLockedBalances(keyphrase.toLowerCase().trim());
      setClaimables(balances);

      if (balances.length === 0) {
        toast.info("Tidak ada saldo terkunci yang ditemukan untuk dompet ini.");
      } else {
        toast.success(`Ditemukan ${balances.length} saldo terkunci.`);
      }
    } catch (error) {
      toast.error(error.message || "Gagal mengambil saldo terkunci.");
      console.error(error); // Menambahkan log error untuk debugging
    } finally {
      setIsLoading(false);
    }
  };

  // Gaya untuk tombol tab agar kode JSX lebih bersih
  const getTabClassName = (tabName) => {
    return `px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${
      activeTab === tabName ? 'bg-background text-foreground shadow-sm' : 'hover:bg-background/50'
    }`;
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-start min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-xl mt-10">
        <div className="p-4 border-b">
          <div className="grid w-full grid-cols-2 bg-muted p-1 rounded-md">
            <button
              onClick={() => setActiveTab('locked-coins')}
              className={getTabClassName('locked-coins')}
            >
              Koin Terkunci
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={getTabClassName('transfer')}
            >
              Transfer
            </button>
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'locked-coins' && (
            <LockedCoinsViewer
              loading={isLoading}
              balances={claimables}
              handleSubmit={handleFetchBalances}
              keyphrase={keyphrase}
              setKeyphrase={setKeyphrase}
            />
          )}
          {activeTab === 'transfer' && (
            <TransferForm
              claimables={claimables}
              sourceKeyphrase={keyphrase}
              setSourceKeyphrase={setKeyphrase}
            />
          )}
        </div>
      </Card>
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default App;
