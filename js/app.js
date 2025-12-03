const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    // App Navigation State
    const currentView = ref('home'); // 'home', 'tables', 'register'

    // State
    const currentDate = ref('2022/04/04'); // Updated to match image
    const staffName = ref('オーナー'); // Default

    // Table Data (Mock)
    const tables = ref([
      { id: 'C1', name: 'C1', status: 'ordered', people: 2, amount: 2740, time: '16:47', duration: '00:00' },
      { id: 'C2', name: 'C2', status: 'served', people: 6, amount: 5520, time: '16:46', duration: '00:31' },
      { id: 'C3', name: 'C3', status: 'ordered', people: 2, amount: 3700, time: '16:46', duration: '00:00' },
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
    const subtotal = ref(0);
    const serviceCharge = ref(0);
    const lateNightCharge = ref(0);

    // Discount Data
    const discountList = ref([]); // { type: 'value'|'percent', value: number, name: string }
    const showDiscountModal = ref(false);
    const discountTab = ref('value'); // 'value' or 'percent'
    const discountInput = ref('');

    // Voucher Data
    const voucherList = ref([]); // { value: number, name: string }
    const showVoucherModal = ref(false);
    const voucherInput = ref('');
    const voucherTypes = [
        { id: 1, name: 'ジェフグルメ' },
        { id: 2, name: 'ビール券' },
        { id: 3, name: 'お食事券' },
        { id: 4, name: 'クーポン' },
        { id: 99, name: 'その他金券' }
    ];
    const selectedVoucherType = ref(voucherTypes[0]);
    const inputAmount = ref('0');
    const inputBuffer = ref('');
    const receivedAmount = ref(0);
    const paymentMethod = ref('cash');

    // Modal State
    const showCheckoutModal = ref(false);

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
    const discountTotal = computed(() => {
        let total = 0;
        let currentSubtotal = subtotal.value;

        // Apply fixed value discounts first
        discountList.value.forEach(d => {
            if (d.type === 'value') {
                total += d.value;
                currentSubtotal -= d.value;
            }
        });

        // Apply percentage discounts on the remaining subtotal
        if (currentSubtotal < 0) currentSubtotal = 0;

        discountList.value.forEach(d => {
            if (d.type === 'percent') {
                const amount = Math.floor(currentSubtotal * (d.value / 100));
                total += amount;
            }
        });

        const maxDiscount = subtotal.value + serviceCharge.value + lateNightCharge.value;
        return Math.min(total, maxDiscount);
    });

    const voucherTotal = computed(() => {
        return voucherList.value.reduce((sum, v) => sum + v.value, 0);
    });

    const totalAmount = computed(() => {
      const amount = subtotal.value + serviceCharge.value + lateNightCharge.value - discountTotal.value - voucherTotal.value;
      return amount > 0 ? amount : 0;
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
             // Load table data if we were building a real app
             // For now just switch to register view
             // Maybe set subtotal based on table amount to make it dynamic
             subtotal.value = table.amount;
             discountList.value = []; // Reset discounts
             voucherList.value = []; // Reset vouchers
             receivedAmount.value = 0;
             inputBuffer.value = '';
             inputAmount.value = '0';
             showCheckoutModal.value = false; // Ensure modal is closed
             navigateTo('register');
        }
    };

    const handleCheckout = () => {
        // Simple validation
        if (totalAmount.value > 0 && receivedAmount.value >= totalAmount.value) {
            showCheckoutModal.value = true;
        } else {
            // In a real app, show error or shake animation
            alert('お預かり金額が不足しています');
        }
    };

    const closeCheckoutModal = (action) => {
        showCheckoutModal.value = false;

        // Reset Transaction
        subtotal.value = 0;
        discountList.value = [];
        voucherList.value = [];
        receivedAmount.value = 0;
        inputBuffer.value = '';
        inputAmount.value = '0';

        if (action === 'menu') {
            navigateTo('home');
        } else if (action === 'continuous') {
            navigateTo('tables');
        } else if (action === 'detail') {
             // Stay on register or go to detail view (not implemented)
             // For now, go back to tables as default behavior for "done"
             navigateTo('tables');
        }
    };

    const handleReceiptIssue = () => {
        alert('レシートを発行しました (Simulation)');
    };

    const handlePoints = () => {
        // alert('ポイント付与 (Simulation)');
        const points = Math.floor(totalAmount.value * 0.01);
        alert(`${points}ポイントを付与しました`);
    };

    const handleOfficialReceipt = () => {
        // Implement the "Official Receipt" flow if requested, but for now just an alert or navigate
        // The user prompt mentioned: "If you need a receipt, tap 'Issue Receipt'."
        // "In the receipt issuance screen, you can issue a receipt with any amount."
        // For this task, I'll just show an alert simulating the transition or action.
        const name = prompt('宛名を入力してください', '');
        if (name !== null) {
             alert(`「${name}」様 領収書を発行しました。\n金額: ¥${totalAmount.value.toLocaleString()}`);
        }
    };

    // Discount Methods
    const openDiscountModal = () => {
        showDiscountModal.value = true;
        discountInput.value = '';
        discountTab.value = 'value';
    };

    const closeDiscountModal = () => {
        showDiscountModal.value = false;
    };

    const setDiscountTab = (tab) => {
        discountTab.value = tab;
        discountInput.value = '';
    };

    const handleDiscountNumClick = (num) => {
        if (discountInput.value.length < 8) {
             discountInput.value += num;
        }
    };

    const handleDiscountClear = () => {
        discountInput.value = '';
    };

    const addDiscount = () => {
        if (!discountInput.value) return;
        const val = parseInt(discountInput.value, 10);
        if (isNaN(val) || val <= 0) return;

        if (discountTab.value === 'percent' && val > 100) {
            alert('割引率は100%以下にしてください');
            return;
        }

        discountList.value.push({
            type: discountTab.value,
            value: val,
            name: discountTab.value === 'value' ? `値引 ¥${val.toLocaleString()}` : `割引 ${val}%`
        });

        discountInput.value = '';
    };

    const removeDiscount = (index) => {
        discountList.value.splice(index, 1);
    };

    // Voucher Methods
    const openVoucherModal = () => {
        showVoucherModal.value = true;
        voucherInput.value = '';
        selectedVoucherType.value = voucherTypes[0]; // Reset to default
    };

    const closeVoucherModal = () => {
        showVoucherModal.value = false;
    };

    const handleVoucherNumClick = (num) => {
        if (voucherInput.value.length < 8) {
             voucherInput.value += num;
        }
    };

    const handleVoucherClear = () => {
        voucherInput.value = '';
    };

    const addVoucher = () => {
        if (!voucherInput.value) return;
        const val = parseInt(voucherInput.value, 10);
        if (isNaN(val) || val <= 0) return;

        const typeName = selectedVoucherType.value ? selectedVoucherType.value.name : '金券';
        voucherList.value.push({
            value: val,
            name: `${typeName} ¥${val.toLocaleString()}`
        });

        voucherInput.value = '';
    };

    const removeVoucher = (index) => {
        voucherList.value.splice(index, 1);
    };

    const selectVoucherType = (type) => {
        selectedVoucherType.value = type;
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

    // Simulate adding an order for demo purposes
    const handleOrder = () => {
        if (products.length > 0) {
            // Add a random product
            const randomProduct = products[Math.floor(Math.random() * products.length)];
            subtotal.value += randomProduct.price;
        } else {
             subtotal.value += 1000;
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
      showCheckoutModal,
      handleCheckout,
      closeCheckoutModal,
      handleReceiptIssue,
      handlePoints,
      handleOfficialReceipt,
      showDiscountModal,
      discountTab,
      discountInput,
      discountList,
      openDiscountModal,
      closeDiscountModal,
      setDiscountTab,
      handleDiscountNumClick,
      handleDiscountClear,
      addDiscount,
      removeDiscount,
      showVoucherModal,
      voucherList,
      voucherInput,
      openVoucherModal,
      closeVoucherModal,
      handleVoucherNumClick,
      handleVoucherClear,
      addVoucher,
      removeVoucher,
      voucherTotal,
      voucherTypes,
      selectedVoucherType,
      selectVoucherType
    };
  }
}).mount('#app');
