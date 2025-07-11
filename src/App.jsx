import React, { useState } from 'react';
import { getLockedBalances } from './lib/pi-network-utils';
import { Toaster, toast } from 'sonner';
import { Card } from './components/ui/Card';
import LockedCoinsViewer from './components/LockedCoinsViewer';
import TransferForm from './components/TransferForm';

function App() {
  const [activeTab, setActiveTab] = useState('locked-coins');
  const [keyphrase, setKeyphrase] = useState("");
  const [claimables, setClaimables] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFetchBalances = async (event) => {
    event.preventDefault();
    if (!keyphrase) return toast.error("Silakan masukkan frasa sandi dompet Anda.");
    setIsLoading(true);
    try {
      const { balances } = await getLockedBalances(keyphrase.toLowerCase().trim());
      setClaimables(balances);
      if (balances.length === 0) {
        toast.info("Tidak ada saldo terkunci yang ditemukan untuk dompet ini.");
      } else {
        toast.success(`Ditemukan ${balances.length} saldo terkunci.`);
      }
    } catch (error) {
      toast.error(error.message || "Gagal mengambil saldo terkunci.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 flex justify-center items-start min-h-screen bg-secondary">
      <Card className="w-full max-w-md shadow-xl mt-10">
        <div className="p-4 border-b">
          <div className="grid w-full grid-cols-2 bg-muted p-1 rounded-md">
            <button
              onClick={() => setActiveTab('locked-coins')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${activeTab === 'locked-coins' ? 'bg-background text-foreground shadow-sm' : ''}`}
            >
              Koin Terkunci
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`px-3 py-1.5 text-sm font-medium rounded-sm transition-all ${activeTab === 'transfer' ? 'bg-background text-foreground shadow-sm' : ''}`}
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
      <Toaster richColors />
    </div>
  );
}

export default App;