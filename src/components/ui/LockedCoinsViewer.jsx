import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';
import { Copy, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function LockedCoinsViewer({ loading, balances, handleSubmit, keyphrase, setKeyphrase }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopy = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success("ID Saldo disalin!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Lihat Koin Terkunci</h2>
        <p className="text-sm text-muted-foreground">Masukkan frasa sandi dompet untuk melihat saldo.</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="keyphrase">Frasa Sandi Dompet</Label>
          <Input id="keyphrase" type="password" placeholder="Masukkan frasa sandi..." value={keyphrase} onChange={(e) => setKeyphrase(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading || !keyphrase}>
          {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Mencari...</> : 'Lihat Saldo'}
        </Button>
      </form>
      {balances.length > 0 && (
        <div className="space-y-3 mt-6">
          <h3 className="font-medium">Saldo Ditemukan</h3>
          <div className="space-y-2">
            {balances.map((balance, index) => (
              <Card key={balance.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">Saldo #{index + 1}</span>
                    <span className="font-semibold text-lg">{balance.amount} {balance.asset}</span>
                    <span className="text-xs font-mono text-muted-foreground truncate max-w-[200px] sm:max-w-xs">{balance.id}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleCopy(balance.id)}>
                    {copiedId === balance.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}