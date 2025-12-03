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
    const lateNightCharge = ref(0);
    const discountList = ref([]); // { id, name, type: 'value'|'percent', value, amount }

    // Payment Data
    const inputAmount = ref('0');
    const inputBuffer = ref('');
    const receivedAmount = ref(0);
    const paymentMethod = ref('cash');
    const showCheckoutModal = ref(false);

    // Discount Modal State
    const showDiscountModal = ref(false);
    const discountTab = ref('value'); // 'value' or 'percent'
    const discountInputValue = ref(0);
    const selectedPreset = ref(null); // { name, value, type }

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

    const discountTotal = computed(() => {
        let total = 0;
        let currentSubtotal = subtotal.value;

        // First pass: Calculate Value Discounts
        const valueDiscounts = discountList.value.filter(d => d.type === 'value');
        const valueDiscountSum = valueDiscounts.reduce((sum, d) => sum + d.amount, 0);

        total += valueDiscountSum;

        // Remaining base for percent calculation
        let baseForPercent = Math.max(0, currentSubtotal - valueDiscountSum);

        // Second pass: Calculate Percent Discounts
        const percentDiscounts = discountList.value.filter(d => d.type === 'percent');
        percentDiscounts.forEach(d => {
             // For percent discount, amount is calculated on baseForPercent
             // In POS logic often percent applies to remaining balance
             const amt = Math.floor(baseForPercent * (d.value / 100));
             total += amt;
        });

        return total;
    });

    const totalAmount = computed(() => {
      return Math.max(0, subtotal.value + serviceCharge.value + lateNightCharge.value - discountTotal.value);
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
             discountList.value = [];
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
        // Reset modal state
        discountTab.value = 'value';
        discountInputValue.value = 0;
        selectedPreset.value = null;
        showDiscountModal.value = true;
    };

    const confirmDiscount = () => {
        let name = '';
        let amount = 0;
        let value = 0;
        const type = discountTab.value;

        if (selectedPreset.value && selectedPreset.value.name !== '手動入力') {
            name = selectedPreset.value.name;
            value = selectedPreset.value.value;
        } else {
             // Manual
             value = parseInt(discountInputValue.value, 10);
             if (isNaN(value) || value <= 0) {
                 alert("値を入力してください");
                 return;
             }
             if (type === 'value') {
                 name = `${value}円値引き`;
             } else {
                 name = `${value}%割引`;
             }
        }

        // Add to list
        discountList.value.push({
            id: Date.now(),
            name: name,
            type: type,
            value: value,
            amount: type === 'value' ? value : 0 // For percent, amount is dynamic
        });

        showDiscountModal.value = false;
    };

    const removeDiscount = (index) => {
        discountList.value.splice(index, 1);
    };

    // Helper to get display amount for a discount in the list
    const getDiscountAmount = (discount) => {
        if (discount.type === 'value') return discount.value;
        if (discount.type === 'percent') {
             const valueDiscounts = discountList.value.filter(d => d.type === 'value');
             const valueSum = valueDiscounts.reduce((sum, d) => sum + d.value, 0);
             const base = Math.max(0, subtotal.value - valueSum);
             return Math.floor(base * (discount.value / 100));
        }
        return 0;
    };

    const handleVoucher = () => {
         const input = prompt("金券金額を入力してください (円)", "0");
         if (input !== null) {
            const val = parseInt(input, 10);
            if (!isNaN(val)) {
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
        showCheckoutModal.value = true;
    };

    const closeCheckoutModal = () => {
        showCheckoutModal.value = false;
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
    };

    const handleIssueReceipt = () => {
        alert("レシートを発行しました");
    };

    const handleGrantPoints = () => {
        alert("ポイント付与（未実装）");
    };

    const handleIssueOfficialReceipt = () => {
        alert("領収書を発行しました");
    };

    const handleSlipDetails = () => {
        alert("伝票明細（未実装）");
    };

    const handleContinuousCheckout = () => {
        alert("連続会計（未実装）");
        closeCheckoutModal();
    };

    return {
      currentDate,
      staffName,
      subtotal,
      serviceCharge,
      lateNightCharge,
      discountList,
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
      handleCheckout,
      showCheckoutModal,
      closeCheckoutModal,
      handleIssueReceipt,
      handleGrantPoints,
      handleIssueOfficialReceipt,
      handleSlipDetails,
      handleContinuousCheckout,
      showDiscountModal,
      discountTab,
      discountInputValue,
      selectedPreset,
      confirmDiscount,
      removeDiscount,
      getDiscountAmount
    };
  }
}).mount('#app');
