import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, DollarSign, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Finance = ({ user, onLogout }) => {
  const [summary, setSummary] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    type: 'expense',
    category: 'software',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    payment_method: 'bank',
  });

  useEffect(() => {
    if (user.role === 'Admin') {
      fetchSummary();
      fetchTransactions();
    }
  }, [user]);

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API}/finance/summary`);
      setSummary(response.data);
    } catch (error) {
      toast.error('Failed to fetch finance summary');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/finance/transactions`);
      setTransactions(response.data);
    } catch (error) {
      toast.error('Failed to fetch transactions');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/finance/transactions`, {
        ...formData,
        amount: parseFloat(formData.amount),
        created_by: user.id,
      });
      toast.success('Transaction added successfully');
      setDialogOpen(false);
      setFormData({
        type: 'expense',
        category: 'software',
        amount: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        payment_method: 'bank',
      });
      fetchSummary();
      fetchTransactions();
    } catch (error) {
      toast.error('Failed to add transaction');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`${API}/finance/transactions/${id}`);
        toast.success('Transaction deleted');
        fetchSummary();
        fetchTransactions();
      } catch (error) {
        toast.error('Failed to delete transaction');
      }
    }
  };

  if (user.role !== 'Admin') {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400">Only Admin can access the Finance module</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2" data-testid="finance-title">Finance & Payments</h1>
            <p className="text-base text-gray-400">Track expenses, revenue, and salary payments</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-primary" data-testid="add-transaction-button">
                <Plus size={18} className="mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)] text-white">
              <DialogHeader>
                <DialogTitle className="text-white">Add Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div>
                  <Label className="text-gray-300">Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                      <SelectItem value="income" className="text-white">Income</SelectItem>
                      <SelectItem value="expense" className="text-white">Expense</SelectItem>
                      <SelectItem value="salary" className="text-white">Salary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1a1a] border-[rgba(255,215,0,0.2)]">
                      <SelectItem value="software" className="text-white">Software Tools</SelectItem>
                      <SelectItem value="marketing" className="text-white">Marketing</SelectItem>
                      <SelectItem value="content" className="text-white">Content Production</SelectItem>
                      <SelectItem value="operational" className="text-white">Operational</SelectItem>
                      <SelectItem value="salary" className="text-white">Salary</SelectItem>
                      <SelectItem value="revenue" className="text-white">Revenue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-gray-300">Amount (₹)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                    data-testid="amount-input"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Date</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    className="bg-[rgba(255,255,255,0.05)] border-[rgba(255,215,0,0.2)] text-white"
                  />
                </div>
                <Button type="submit" className="w-full btn-primary" data-testid="submit-transaction-button">
                  Add Transaction
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="stat-card bg-[rgba(255,255,255,0.03)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-green-500/20">
                    <TrendingUp size={24} className="text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">₹{summary.total_income.toLocaleString()}</div>
                </div>
                <h3 className="text-sm text-gray-400">Total Income</h3>
              </CardContent>
            </Card>

            <Card className="stat-card bg-[rgba(255,255,255,0.03)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-red-500/20">
                    <TrendingDown size={24} className="text-red-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">₹{summary.total_expenses.toLocaleString()}</div>
                </div>
                <h3 className="text-sm text-gray-400">Total Expenses</h3>
              </CardContent>
            </Card>

            <Card className="stat-card bg-[rgba(255,255,255,0.03)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-yellow-500/20">
                    <DollarSign size={24} className="text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-white">₹{summary.total_salary.toLocaleString()}</div>
                </div>
                <h3 className="text-sm text-gray-400">Total Salary Paid</h3>
              </CardContent>
            </Card>

            <Card className="stat-card bg-[rgba(255,255,255,0.03)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-blue-500/20">
                    <DollarSign size={24} className="text-blue-400" />
                  </div>
                  <div className={`text-3xl font-bold ${summary.net_balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ₹{summary.net_balance.toLocaleString()}
                  </div>
                </div>
                <h3 className="text-sm text-gray-400">Net Balance</h3>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Transactions */}
        <Card className="glass-effect border-[rgba(255,215,0,0.1)]">
          <CardHeader>
            <CardTitle className="text-white">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="p-4 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,215,0,0.1)] flex items-center justify-between"
                    data-testid={`transaction-${transaction.id}`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span
                          className={`px-2 py-1 text-xs rounded ${
                            transaction.type === 'income'
                              ? 'bg-green-500/20 text-green-400'
                              : transaction.type === 'salary'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {transaction.type}
                        </span>
                        <span className="text-xs px-2 py-1 rounded bg-[rgba(255,215,0,0.1)] text-yellow-500">
                          {transaction.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-white mb-1">{transaction.description}</h4>
                      <p className="text-sm text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`text-2xl font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                        {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-400 hover:text-red-300"
                        data-testid={`delete-transaction-${transaction.id}`}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Finance;
