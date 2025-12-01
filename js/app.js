const { createApp, ref, computed, onMounted } = Vue;

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

    // Products
    const products = ref([]);

    onMounted(async () => {
        try {
            // Load staff data
            const staffResponse = await fetch('data/staff.json');
            if (staffResponse.ok) {
                const staffData = await staffResponse.json();
                if (staffData.length > 0) {
                    staffName.value = staffData[0].name;
                }
            }

            // Load products
            const productsResponse = await fetch('data/products.json');
            if (productsResponse.ok) {
                products.value = await productsResponse.json();
            }
        } catch (e) {
            console.error("Failed to load data", e);
        }
    });

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
        // Logic to finalize transaction would go here
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
        if (products.value.length > 0) {
            // Add a random product
            const randomProduct = products.value[Math.floor(Math.random() * products.value.length)];
            subtotal.value += randomProduct.price;
        } else {
             // Fallback if fetch failed
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
