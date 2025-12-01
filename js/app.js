const { createApp, ref, computed } = Vue;

createApp({
  setup() {
    // State
    const currentDate = ref('2020/08/06');
    const staffName = ref('オーナー'); // Default

    // Transaction Data
    const subtotal = ref(0);
    const serviceCharge = ref(0);
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
      handleOrder
    };
  }
}).mount('#app');
