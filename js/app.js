const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    // App Navigation State
    const currentView = ref('home'); // 'home', 'tables', 'register'

    // State
    const currentDate = ref('2022/04/04'); // Updated to match image
    const staffName = ref('オーナー'); // Default
    const currentTable = ref(null);
    const isServiceChargeEnabled = ref(true);

    // Table Data (Mock)
    const tables = ref([
      { id: 'C1', name: 'C1', status: 'ordered', people: 2, amount: 2740, time: '16:47', duration: '00:00', items: [
          { name: 'ポテトフライ', price: 430, quantity: 1 },
          { name: 'ハムカツ', price: 430, quantity: 1 },
          { name: '生ビール', price: 940, quantity: 2 }
      ]},
      { id: 'C2', name: 'C2', status: 'served', people: 6, amount: 5520, time: '16:46', duration: '00:31', items: [] },
      { id: 'C3', name: 'C3', status: 'ordered', people: 2, amount: 3700, time: '16:46', duration: '00:00', items: [] },
      { id: 'C4', name: 'C4', status: 'checkout', people: 2, amount: 1700, time: '16:47', duration: '00:00' },
      { id: 'C5', name: 'C5', status: 'ordered', people: 1, amount: 1900, time: '15:58', duration: '00:00' },
      { id: 'C6', name: 'C6', status: 'ordered-alert', people: 2, amount: 700, time: '16:45', duration: '00:00' },
      { id: 'C7', name: 'C7', status: 'ordered', people: 1, amount: 1000, time: '16:49', duration: '00:00' },
      { id: 'C8', name: 'C8', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
      { id: 'C9', name: 'C9', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
      { id: 'C10', name: 'C10', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
      { id: 'T1', name: 'T1', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
      { id: 'T2', name: 'T2', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
      { id: 'T3', name: 'T3', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
      { id: 'T4', name: 'T4', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
      { id: 'T5', name: 'T5', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
      { id: 'T6', name: 'T6', status: 'empty', people: 0, amount: 0, time: '', duration: '' },
    ]);

    // Transaction Data
    // subtotal is computed from items
    const lateNightCharge = ref(0);
    const discountTotal = ref(0);

    // Payment Data
    const inputAmount = ref('0');
    const inputBuffer = ref('');
    const receivedAmount = ref(0);
    const paymentMethod = ref('cash');

    // Hardcoded Data (replacing JSON files)
    const products = [
      { id: 1, categoryId: 1, name: "ブレンドコーヒー", price: 450 },
      { id: 2, categoryId: 1, name: "カフェラテ", price: 500 },
      { id: 3, categoryId: 2, name: "サンドイッチ", price: 600 },
      { id: 4, categoryId: 3, name: "カレーライス", price: 800 }
    ];

    const staffList = [
      { id: "001", name: "オーナー", password: "0000", role: "owner" },
      { id: "002", name: "店長", password: "1234", role: "manager" },
      { id: "003", name: "スタッフ", password: "5678", role: "staff" }
    ];

    // Initialize staff if needed, currently defaulting to owner
    if (staffList.length > 0) {
        staffName.value = staffList[0].name;
    }

    // Computed
    const subtotal = computed(() => {
        if (!currentTable.value || !currentTable.value.items) return 0;
        return currentTable.value.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    });

    const serviceCharge = computed(() => {
        return isServiceChargeEnabled.value ? Math.floor(subtotal.value * 0.1) : 0;
    });

    const totalAmount = computed(() => {
      return subtotal.value + serviceCharge.value + lateNightCharge.value - discountTotal.value;
    });

    const taxAmount = computed(() => {
      return Math.floor(totalAmount.value * 0.1);
    });

    const changeAmount = computed(() => {
      if (receivedAmount.value < totalAmount.value) return 0;
      return receivedAmount.value - totalAmount.value;
    });

    const balanceAmount = computed(() => {
        if (receivedAmount.value >= totalAmount.value) return 0;
        return totalAmount.value - receivedAmount.value;
    });

    // Methods
    const navigateTo = (view) => {
        currentView.value = view;
    };

    const handleTableClick = (table) => {
        if (table.status !== 'empty') {
             currentTable.value = table;
             // Reset transaction state
             receivedAmount.value = 0;
             discountTotal.value = 0;
             inputBuffer.value = '';
             inputAmount.value = '0';
             isServiceChargeEnabled.value = true;
             navigateTo('register');
        }
    };

    const handleNumClick = (num) => {
      if (inputBuffer.value === '' && num === '00') return;
      if (inputBuffer.value === '0' && num === '0') return;
      if (inputBuffer.value === '0' && num !== '0') inputBuffer.value = '';

      if (inputBuffer.value.length < 10) {
        inputBuffer.value += num;
        inputAmount.value = inputBuffer.value;
      }
    };

    const handleClear = () => {
      inputBuffer.value = '';
      inputAmount.value = '0';
    };

    const handleBalance = () => {
        const balance = balanceAmount.value;
        if (balance > 0) {
            inputBuffer.value = balance.toString();
            inputAmount.value = inputBuffer.value;
        }
    }

    const handleEnter = () => {
      if (inputBuffer.value === '') return;
      const amount = parseInt(inputBuffer.value, 10);

      if (!isNaN(amount)) {
        receivedAmount.value = amount;
      }
    };

    const formatCurrency = (value) => {
        return '¥' + value.toLocaleString();
    };

    const setPaymentMethod = (method) => {
        paymentMethod.value = method;
    };

    // Simulate adding an order
    const handleOrder = () => {
        if (!currentTable.value) return;
        if (products.length > 0) {
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            if (!currentTable.value.items) currentTable.value.items = [];

            const existing = currentTable.value.items.find(i => i.name === randomProduct.name);
            if (existing) {
                existing.quantity++;
            } else {
                currentTable.value.items.push({ ...randomProduct, quantity: 1 });
            }
        }
    };

    const handleDiscount = () => {
        const input = prompt("値引額を入力してください (円)", "0");
        if (input !== null) {
            const val = parseInt(input, 10);
            if (!isNaN(val)) discountTotal.value = val;
        }
    };

    const handleVoucher = () => {
         const input = prompt("金券金額を入力してください (円)", "0");
         if (input !== null) {
            const val = parseInt(input, 10);
            if (!isNaN(val)) {
                // Treat voucher as received amount or discount? usually it's payment.
                // For simplicity, let's add to received amount or just alert.
                // Or maybe treat as "Other Payment".
                alert(`金券 ${val}円を受け付けました（機能未実装）`);
            }
         }
    };

    const handleSplitCheck = () => {
        alert("伝票分割機能は未実装です。");
    };

    const handleMemo = () => {
        prompt("支払メモを入力してください", "");
    };

    const handleCustomerInfo = () => {
        alert("お客様情報設定画面（未実装）");
    };

    const handleCheckout = () => {
        if (balanceAmount.value > 0) {
            alert(`残額が ${formatCurrency(balanceAmount.value)} あります。`);
            return;
        }

        if (confirm("会計を確定しますか？")) {
            alert(`おつり: ${formatCurrency(changeAmount.value)}\nありがとうございました。`);

            // Clear table
            if (currentTable.value) {
                currentTable.value.status = 'empty';
                currentTable.value.items = [];
                currentTable.value.amount = 0;
                currentTable.value.people = 0;
                currentTable.value.time = '';
                currentTable.value.duration = '';
            }
            navigateTo('tables');
        }
    };

    return {
      currentDate,
      staffName,
      subtotal,
      serviceCharge,
      lateNightCharge,
      discountTotal,
      totalAmount,
      taxAmount,
      receivedAmount,
      changeAmount,
      balanceAmount,
      inputAmount,
      paymentMethod,
      handleNumClick,
      handleClear,
      handleEnter,
      handleBalance,
      formatCurrency,
      setPaymentMethod,
      handleOrder,
      currentView,
      navigateTo,
      tables,
      handleTableClick,
      currentTable,
      isServiceChargeEnabled,
      handleDiscount,
      handleVoucher,
      handleSplitCheck,
      handleMemo,
      handleCustomerInfo,
      handleCheckout
    };
  }
}).mount('#app');
