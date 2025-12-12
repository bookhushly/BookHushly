import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  CheckCircle,
  Building2,
  X,
  AlertCircle,
} from "lucide-react";

const BankAccountManager = ({ onSelectAccount, selectedAccountId }) => {
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingAccount, setAddingAccount] = useState(false);

  const [formData, setFormData] = useState({
    bank_name: "",
    bank_code: "",
    account_number: "",
    account_name: "",
    is_default: false,
  });

  const nigerianBanks = [
    { name: "Access Bank", code: "044" },
    { name: "Citibank", code: "023" },
    { name: "Ecobank Nigeria", code: "050" },
    { name: "Fidelity Bank", code: "070" },
    { name: "First Bank of Nigeria", code: "011" },
    { name: "First City Monument Bank", code: "214" },
    { name: "Globus Bank", code: "00103" },
    { name: "Guaranty Trust Bank", code: "058" },
    { name: "Heritage Bank", code: "030" },
    { name: "Keystone Bank", code: "082" },
    { name: "Kuda Bank", code: "50211" },
    { name: "Opay", code: "999992" },
    { name: "Palmpay", code: "999991" },
    { name: "Polaris Bank", code: "076" },
    { name: "Providus Bank", code: "101" },
    { name: "Stanbic IBTC Bank", code: "221" },
    { name: "Standard Chartered Bank", code: "068" },
    { name: "Sterling Bank", code: "232" },
    { name: "Suntrust Bank", code: "100" },
    { name: "Union Bank of Nigeria", code: "032" },
    { name: "United Bank for Africa", code: "033" },
    { name: "Unity Bank", code: "215" },
    { name: "Wema Bank", code: "035" },
    { name: "Zenith Bank", code: "057" },
  ];

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async () => {
    setLoading(true);
    try {
      const mockAccounts = [
        {
          id: "1",
          bank_name: "Guaranty Trust Bank",
          bank_code: "058",
          account_number: "0123456789",
          account_name: "John Doe",
          is_default: true,
          is_verified: true,
        },
      ];
      setBankAccounts(mockAccounts);
    } catch (error) {
      console.error("Error loading bank accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (
      !formData.bank_name ||
      !formData.account_number ||
      !formData.account_name
    ) {
      alert("Please fill all required fields");
      return;
    }

    if (formData.account_number.length !== 10) {
      alert("Account number must be 10 digits");
      return;
    }

    setAddingAccount(true);

    try {
      const newAccount = {
        id: Date.now().toString(),
        ...formData,
        is_verified: false,
      };

      setBankAccounts([...bankAccounts, newAccount]);
      setShowAddModal(false);
      setFormData({
        bank_name: "",
        bank_code: "",
        account_number: "",
        account_name: "",
        is_default: false,
      });
    } catch (error) {
      console.error("Error adding bank account:", error);
      alert("Failed to add bank account");
    } finally {
      setAddingAccount(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (!confirm("Are you sure you want to delete this bank account?")) {
      return;
    }

    try {
      setBankAccounts(bankAccounts.filter((acc) => acc.id !== accountId));
    } catch (error) {
      console.error("Error deleting bank account:", error);
      alert("Failed to delete bank account");
    }
  };

  const handleBankSelect = (e) => {
    const selectedBank = nigerianBanks.find(
      (bank) => bank.code === e.target.value
    );
    if (selectedBank) {
      setFormData({
        ...formData,
        bank_code: selectedBank.code,
        bank_name: selectedBank.name,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Bank Accounts</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Account
        </button>
      </div>

      {bankAccounts.length === 0 ? (
        <div className="text-center py-12 bg-purple-50 rounded-2xl border-2 border-dashed border-purple-200">
          <Building2 className="h-12 w-12 text-purple-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No bank accounts added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Your First Account
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              onClick={() => onSelectAccount && onSelectAccount(account)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                selectedAccountId === account.id
                  ? "border-purple-600 bg-purple-50"
                  : "border-purple-100 bg-white hover:border-purple-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className={`p-3 rounded-xl ${
                      selectedAccountId === account.id
                        ? "bg-purple-100"
                        : "bg-purple-50"
                    }`}
                  >
                    <Building2
                      className={`h-6 w-6 ${
                        selectedAccountId === account.id
                          ? "text-purple-700"
                          : "text-purple-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">
                        {account.bank_name}
                      </h4>
                      {account.is_default && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                          Default
                        </span>
                      )}
                      {account.is_verified && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">
                      {account.account_number}
                    </p>
                    <p className="text-sm font-medium text-gray-900">
                      {account.account_name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAccount(account.id);
                  }}
                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
              {selectedAccountId === account.id && (
                <div className="mt-3 pt-3 border-t border-purple-200">
                  <div className="flex items-center gap-2 text-sm text-purple-700">
                    <CheckCircle className="h-4 w-4" />
                    <span className="font-medium">Selected for withdrawal</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                Add Bank Account
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Bank
                </label>
                <select
                  value={formData.bank_code}
                  onChange={handleBankSelect}
                  className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-300 transition-all"
                >
                  <option value="">Choose your bank</option>
                  {nigerianBanks.map((bank) => (
                    <option key={bank.code} value={bank.code}>
                      {bank.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Number
                </label>
                <input
                  type="text"
                  value={formData.account_number}
                  onChange={(e) =>
                    setFormData({ ...formData, account_number: e.target.value })
                  }
                  placeholder="0123456789"
                  maxLength="10"
                  className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-300 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={formData.account_name}
                  onChange={(e) =>
                    setFormData({ ...formData, account_name: e.target.value })
                  }
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-purple-100 rounded-xl focus:outline-none focus:border-purple-300 transition-all"
                />
                <p className="text-xs text-gray-500 mt-2 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Ensure the account name matches your bank records exactly
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_default"
                  checked={formData.is_default}
                  onChange={(e) =>
                    setFormData({ ...formData, is_default: e.target.checked })
                  }
                  className="w-5 h-5 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="is_default" className="text-sm text-gray-700">
                  Set as default account
                </label>
              </div>

              <button
                onClick={handleAddAccount}
                disabled={addingAccount}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:cursor-not-allowed"
              >
                {addingAccount ? "Adding Account..." : "Add Bank Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountManager;
