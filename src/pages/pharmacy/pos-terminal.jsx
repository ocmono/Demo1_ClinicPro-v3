//pos-terminal.jsx
import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { useMedicines } from '../../context/MedicinesContext';
import { usePatient } from '../../context/PatientContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import PageHeader from '@/components/shared/pageHeader/PageHeader';
import MedicineCart from './posComponent/MedicineCart';
import MedicineTable from './posComponent/MedicineTable';
import MedicineCards from './posComponent/MedicineCards';
import '../medicines/add-medicine.css';

// Import new components
import CheckoutConfirmModal from './posComponent/CheckoutConfirmModal';
import DraftListModal from './posComponent/DraftListModal';
import SaveDraftModal from './posComponent/SaveDraftModal';
import PrescriptionsModal from './posComponent/PrescriptionsModal';
import DiscountEditModal from './posComponent/DiscountEditModal';
import CameraScannerModal from './posComponent/CameraScannerModal';

import { 
  FaSearch, FaBarcode, FaCreditCard, FaUser, FaMoneyBillWave,FaCreditCard as FaCard, FaMobileAlt , FaFileInvoiceDollar, FaCapsules, FaSort, FaSortUp,
  FaSortDown, FaTh, FaList, FaGift, FaReceipt, FaExchangeAlt, FaFolderOpen, FaKeyboard, FaKey, FaFileMedical, FaCamera , FaTruck } from 'react-icons/fa';

const paymentMethods = ['Cash', 'Card', 'UPI', 'Gift Card'];
const PAGE_SIZE = 8;

const POSTerminal = () => {
  const { medicines, editMedicine } = useMedicines();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customer, setCustomer] = useState('');
  const [customerSearch, setCustomerSearch] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(paymentMethods[0]);
  const [discountType, setDiscountType] = useState('flat');
  const [discountValue, setDiscountValue] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkoutDialog, setCheckoutDialog] = useState(false);
  const navigate = useNavigate();
  const [barcode, setBarcode] = useState('');
  const [selectedMedicineType, setSelectedMedicineType] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [viewMode, setViewMode] = useState('table');
  
// In the main POS component, add these state variables:
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [showDeliveryChargeEdit, setShowDeliveryChargeEdit] = useState(false);
  // New state variables
  const [roundOffEnabled, setRoundOffEnabled] = useState(true);
  const [showDiscountEdit, setShowDiscountEdit] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState({
    receivedAmount: '',
    payingAmount: '',
    change: 0,
    paymentReceiver: '',
    paymentNote: '',
    giftCardCode: ''
  });

  // Final total state variable
  const [finalTotal, setFinalTotal] = useState(0);

  const [showQRCode, setShowQRCode] = useState(false);
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showDraftsList, setShowDraftsList] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [customerError, setCustomerError] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState(null);

  // State for dropdown visibility
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);
  const [showMedicineDropdown, setShowMedicineDropdown] = useState(false);
  const [showBarcodeDropdown, setShowBarcodeDropdown] = useState(false);

  // Camera scanner state
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraPermission, setCameraPermission] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);

  // Prescription state
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [showPrescriptions, setShowPrescriptions] = useState(false);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);

  // State to track if medicine search has been made
  const [hasSearched, setHasSearched] = useState(false);

  // Add near other state declarations
const [showPrintModal, setShowPrintModal] = useState(false);

  // Refs
  const barcodeRef = useRef();
  const searchRef = useRef();
  const customerSearchRef = useRef();
  const videoRef = useRef(null);
  const barcodeDetectorRef = useRef(null);

  const { patients } = usePatient();
  const token = localStorage.getItem('access_token');

  // Load drafts from localStorage on component mount
  useEffect(() => {
    loadDrafts();
    checkCameraSupport();
    return () => {
      stopCamera();
    };
  }, []);

  // Check if browser supports BarcodeDetector API
  const checkCameraSupport = () => {
    if ('BarcodeDetector' in window) {
      barcodeDetectorRef.current = new BarcodeDetector();
      console.log('BarcodeDetector API is supported');
    } else {
      console.warn('BarcodeDetector API is not supported in this browser');
    }
  };

  // Fetch prescriptions when customer is selected
  useEffect(() => {
    if (customer) {
      fetchPatientPrescriptions(customer);
    } else {
      setPatientPrescriptions([]);
      setShowPrescriptions(false);
    }
  }, [customer]);

  // Fetch patient prescriptions
  const fetchPatientPrescriptions = async (patientId) => {
    try {
      setPrescriptionLoading(true);
      const response = await fetch(`https://bkdemo1.clinicpro.cc/patients/${patientId}/prescriptions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prescriptions');
      }

      const prescriptionsData = await response.json();
      console.log('Patient Prescriptions:', prescriptionsData);
      
      setPatientPrescriptions(prescriptionsData);

    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      // toast.error('Failed to load patient prescriptions');
      setPatientPrescriptions([]);
    } finally {
      setPrescriptionLoading(false);
    }
  };

// Add medicines from prescription to cart - FIXED VERSION
const addPrescriptionToCart = (prescription) => {
  if (!prescription.medicines || prescription.medicines.length === 0) {
    toast.info('No medicines found in this prescription');
    return;
  }

  let addedCount = 0;
  const medicineList = medicines; // Use the medicines from component scope
  
  prescription.medicines.forEach(prescriptionMed => {
    // Find medicine by name (case-insensitive)
    const medicine = medicineList.find(med => 
      med.name.toLowerCase().includes(prescriptionMed.medicine_name.toLowerCase()) ||
      med.name.toLowerCase() === prescriptionMed.medicine_name.toLowerCase()
    );

    if (medicine) {
      // Add the first variation (index 0)
      addToCart(medicine, 0);
      addedCount++;
    } else {
      console.log(`Medicine not found: ${prescriptionMed.medicine_name}`);
    }
  });

  if (addedCount > 0) {
    toast.success(`Added ${addedCount} medicines from prescription to cart`);
    setShowPrescriptions(false);
  } else {
    console.log('No matching medicines found for this prescription');
    // toast.error('No matching medicines found for this prescription');
  }
};
  
// Add single medicine from prescription - FIXED VERSION
const addSingleMedicineFromPrescription = (prescriptionMed) => {
  if (!customer) {
    setCustomerError(true);
    toast.error('Please select a customer first');
    return;
  }

  // Find medicine by name (case-insensitive) using medicines from component scope
  const medicine = medicines.find(med => 
    med.name.toLowerCase().includes(prescriptionMed.medicine_name.toLowerCase()) ||
    med.name.toLowerCase() === prescriptionMed.medicine_name.toLowerCase()
  );

  if (medicine) {
    // Add the first variation (index 0)
    addToCart(medicine, 0);
    toast.success(`Added ${medicine.name} to cart`);
  } else {
    console.log(`Medicine "${prescriptionMed.medicine_name}" not found in inventory`)
    // toast.error(`Medicine "${prescriptionMed.medicine_name}" not found in inventory`);
  }
};

  // Format date for display
  const formatPrescriptionDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Camera Scanner Functions
  const getAvailableCameras = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (error) {
      console.error('Error getting cameras:', error);
      toast.error('Failed to access camera devices');
      return [];
    }
  };

  const startCamera = async (cameraId = null) => {
    try {
      if (!barcodeDetectorRef.current) {
        toast.error('Barcode scanning not supported in this browser');
        return;
      }

      const devices = await getAvailableCameras();
      if (devices.length === 0) {
        toast.error('No cameras found');
        return;
      }

      const deviceId = cameraId || selectedCamera || devices[0].deviceId;
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setCameraPermission('granted');
        startBarcodeDetection();
      }

    } catch (error) {
      console.error('Error starting camera:', error);
      setCameraPermission('denied');
      
      if (error.name === 'NotAllowedError') {
        toast.error('Camera permission denied. Please allow camera access.');
      } else if (error.name === 'NotFoundError') {
        toast.error('No camera found on this device.');
      } else {
        toast.error('Failed to start camera: ' + error.message);
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const startBarcodeDetection = () => {
    if (!barcodeDetectorRef.current || !videoRef.current) return;

    const detectBarcode = async () => {
      if (!isCameraActive || !videoRef.current) return;

      try {
        const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
        
        if (barcodes.length > 0) {
          const barcode = barcodes[0];
          console.log('Barcode detected:', barcode.rawValue);
          
          handleScannedBarcode(barcode.rawValue);
          stopCamera();
          setShowCameraScanner(false);
        }
      } catch (error) {
        console.error('Barcode detection error:', error);
      }

      if (isCameraActive) {
        requestAnimationFrame(detectBarcode);
      }
    };

    detectBarcode();
  };

  const openCameraScanner = async () => {
    if (!customer) {
      setCustomerError(true);
      toast.error('Please select a customer first');
      customerSearchRef.current?.focus();
      return;
    }

    if (!barcodeDetectorRef.current) {
      toast.error('Barcode scanning is not supported in your browser. Please use Chrome, Edge, or another modern browser.');
      return;
    }

    setShowCameraScanner(true);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  const handleScannedBarcode = (barcodeData) => {
    if (!barcodeData) return;

    console.log('Barcode scanned:', barcodeData);
    
    if (barcodeRef.current) {
      barcodeRef.current.focus();
    }

    setBarcode(barcodeData);
    
    setTimeout(() => {
      processBarcodeSearch(barcodeData);
    }, 100);
  };

  const processBarcodeSearch = (barcodeData) => {
    if (!customer) {
      setCustomerError(true);
      toast.error('Please select a customer first');
      customerSearchRef.current?.focus();
      return;
    }

    const med = medicines.find(m => 
      m.variations.some(v => 
        v.sku.toLowerCase() === barcodeData.toLowerCase() || 
        v.sku.toLowerCase().includes(barcodeData.toLowerCase())
      ) || 
      m.name.toLowerCase().includes(barcodeData.toLowerCase())
    );
    
    if (med) {
      addToCart(med, 0);
      toast.success(`Added ${med.name} to cart`);
      setBarcode('');
      setShowBarcodeDropdown(false);
    } else {
      toast.error('No medicine found for this barcode');
    }
  };

  const handleBarcodeInputChange = (e) => {
    const value = e.target.value;
    setBarcode(value);
    
    if (value.length >= 6 && /^[0-9a-zA-Z]+$/.test(value)) {
      setTimeout(() => {
        if (barcodeRef.current && document.activeElement === barcodeRef.current) {
          handleBarcodeEnter({ key: 'Enter' });
        }
      }, 150);
    }
  };

  // Handle medicine search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setPage(1);
    
    // Set hasSearched to true if there's any search text
    if (value.trim() !== '') {
      setHasSearched(true);
    } else {
      setHasSearched(false);
    }
  };

  // Load drafts function
  const loadDrafts = () => {
    const savedDrafts = localStorage.getItem('posDrafts');
    if (savedDrafts) {
      const parsedDrafts = JSON.parse(savedDrafts);
      setDrafts(parsedDrafts);
    }
  };

  // Filter patients for customer search
  const filteredPatients = useMemo(() => {
    if (!customerSearch && !showCustomerDropdown) return [];
    if (!customerSearch && showCustomerDropdown) return patients;
    
    return patients.filter(patient => 
      patient.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (patient.phone && patient.phone.includes(customerSearch)) ||
      (patient.email && patient.email.toLowerCase().includes(customerSearch.toLowerCase()))
    );
  }, [patients, customerSearch, showCustomerDropdown]);

  // Filter medicines for search
  const filteredMedicines = useMemo(() => {
    if (!search && !showMedicineDropdown) return [];
    if (!search && showMedicineDropdown) return medicines;
    
    return medicines.filter(m => 
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.brand.toLowerCase().includes(search.toLowerCase()) ||
      m.variations.some(v => v.sku.toLowerCase().includes(search.toLowerCase()))
    );
  }, [medicines, search, showMedicineDropdown]);

  // Filter medicines for barcode search
  const filteredBarcodeMedicines = useMemo(() => {
    if (!barcode && !showBarcodeDropdown) return [];
    if (!barcode && showBarcodeDropdown) return medicines;
    
    return medicines.filter(m => 
      m.variations.some(v => v.sku.toLowerCase().includes(barcode.toLowerCase())) || 
      m.name.toLowerCase().includes(barcode.toLowerCase())
    );
  }, [medicines, barcode, showBarcodeDropdown]);

  // Sorting function
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return <FaSort className="text-muted" />;
    return sortConfig.direction === 'asc' ? <FaSortUp className="text-primary" /> : <FaSortDown className="text-primary" />;
  };

  // Filter and sort medicines for display
  const filtered = medicines
    .filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.brand.toLowerCase().includes(search.toLowerCase()) ||
        m.variations.some(v => v.sku.toLowerCase().includes(search.toLowerCase()));
      
      const matchesType = selectedMedicineType === 'All' || m.medicine_type === selectedMedicineType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (!sortConfig.key) return 0;

      let aValue, bValue;

      if (sortConfig.key.includes('.')) {
        const keys = sortConfig.key.split('.');
        aValue = keys.reduce((obj, key) => obj?.[key], a);
        bValue = keys.reduce((obj, key) => obj?.[key], b);
      } else if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
        aValue = a.variations[0]?.[sortConfig.key] || 0;
        bValue = b.variations[0]?.[sortConfig.key] || 0;
      } else {
        aValue = a[sortConfig.key] || '';
        bValue = b[sortConfig.key] || '';
      }

      if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const medicineTypes = ["All", ...new Set(medicines.map(item => item.medicine_type).filter(Boolean))];

  const addToCart = (med, variationIdx) => {
    if (!customer) {
      setCustomerError(true);
      toast.error('Please select a customer first');
      customerSearchRef.current?.focus();
      return;
    }

    const variation = med.variations[variationIdx];
    if (Number(variation.stock) <= 0) {
      toast.error('Out of stock!');
      return;
    }

    const existingItemIndex = cart.findIndex(
      item => item.medId === med.id && item.variationIdx === variationIdx
    );

    if (existingItemIndex !== -1) {
      setCart(prev => prev.map((item, index) => 
        index === existingItemIndex 
          ? { ...item, qty: item.qty + 1 }
          : item
      ));
      toast.info('Quantity updated in cart');
    } else {
      setCart(prev => [...prev, { 
        ...variation, 
        medId: med.id, 
        medName: med.name,
        brand: med.brand,
        medicine_type: med.medicine_type,
        variationIdx, 
        qty: 1 
      }]);
      toast.success('Item added to cart');
    }
  };

  const updateQty = (idx, qty) => {
    if (qty < 1) {
      removeFromCart(idx);
      return;
    }
    setCart(prev => prev.map((item, i) => i === idx ? { ...item, qty: Number(qty) } : item));
  };

  const removeFromCart = (idx) => {
    setCart(prev => prev.filter((_, i) => i !== idx));
    toast.info('Item removed from cart');
  };

  const clearCart = () => {
    if (cart.length === 0) {
      toast.info('Cart is already empty');
      return;
    }
    setCart([]);
    toast.info('All items removed from cart');
  };

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + (Number(item.price) * item.qty), 0);
  let discount = 0;
  if (discountType === 'flat') {
    discount = Math.min(Number(discountValue), subtotal);
  } else if (discountType === 'percent') {
    discount = Math.min(subtotal, subtotal * (Number(discountValue) / 100));
  }
  const totalBeforeRound = subtotal - discount + deliveryCharge;
  const roundedTotal = roundOffEnabled ? Math.round(totalBeforeRound) : totalBeforeRound;
  const roundOff = roundedTotal - totalBeforeRound;

  // Handle payment details changes
const handlePaymentDetailChange = (field, value, finalTotal) => {
  setPaymentDetails(prev => {
    const updated = { ...prev, [field]: value };
    
    if (field === 'receivedAmount' && paymentMethod === 'Cash') {
      const received = parseFloat(value) || 0;
      const payable = parseFloat(finalTotal) || 0;
    
      const change = received - payable;
    
      updated.change = change > 0 ? change : 0;
      updated.payingAmount = payable.toFixed(2);
    }
    
      if (field === 'payingAmount' && paymentMethod !== 'Cash') {
      updated.payingAmount = value;
    }
    
    return updated;
  });
};

  // Save to draft functionality
  const saveToDraft = () => {
    if (!customer) {
      setCustomerError(true);
      toast.error('Please select a customer to save as draft');
      return;
    }

    if (cart.length === 0) {
      toast.error('Cart is empty. Add items to save as draft.');
      return;
    }

    const draftData = {
      id: `draft-${Date.now()}`,
      customerId: customer,
      customerName: patients.find(p => p.id === customer)?.name || customerSearch,
      cart: cart,
      subtotal: subtotal,
      discount: discount,
      discountType: discountType,
      discountValue: discountValue,
      deliveryCharge: deliveryCharge,
      roundOffEnabled: roundOffEnabled,
      roundOff: roundOff,
      total: roundedTotal,
      paymentMethod: paymentMethod,
      paymentDetails: paymentDetails,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const existingDrafts = JSON.parse(localStorage.getItem('posDrafts') || '[]');
    const updatedDrafts = [...existingDrafts, draftData];
    
    localStorage.setItem('posDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    
    toast.success('Sale saved as draft successfully!');
    clearCurrentSession();
  };

  // Load draft into current session
  const loadDraft = (draft) => {
    clearCurrentSession();
    
    setCart(draft.cart);
    setCustomer(draft.customerId);
    setCustomerSearch(draft.customerName);
    setDiscountValue(draft.discountValue);
    setDiscountType(draft.discountType);
    setPaymentMethod(draft.paymentMethod);
    setPaymentDetails(draft.paymentDetails);
    setDeliveryCharge(draft.deliveryCharge || 0);
    setRoundOffEnabled(draft.roundOffEnabled);
    setCurrentDraftId(draft.id);
    
    toast.success(`Draft loaded for ${draft.customerName}`);
    setShowDraftsList(false);
  };

  // Delete draft
  const deleteDraft = (draftId) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
    localStorage.setItem('posDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
    toast.info('Draft deleted successfully');
  };

  // Clear current session and reset form
  const clearCurrentSession = () => {
    setCart([]);
    setCustomer('');
    setCustomerSearch('');
    setDiscountValue(0);
    setDiscountType('flat');
    setPaymentMethod(paymentMethods[0]);
    setDeliveryCharge(0);
    setPaymentDetails({
      receivedAmount: '',
      payingAmount: '',
      change: 0,
      paymentReceiver: '',
      paymentNote: '',
      giftCardCode: ''
    });
    setRoundOffEnabled(true);
    setCustomerError(false);
    setCurrentDraftId(null);
    setPatientPrescriptions([]);
    setShowPrescriptions(false);
  };

  const handleCheckout = (total) => {
    if (cart.length === 0) return toast.error('Cart is empty');
    if (!customer) {
      setCustomerError(true);
      toast.error('Please select a customer first');
      return;
    }
  
    setFinalTotal(total);   // 🔥 SINGLE SOURCE OF TRUTH
    setCheckoutDialog(true);
  
    if (paymentMethod === 'UPI') {
      setShowQRCode(true);
    }
  };

  const confirmCheckout = async () => {
    setCheckoutDialog(false);
    setLoading(true);
    
    try {
      const paymentData = [{
        method: paymentMethod.toLowerCase(),
        received_amt: paymentMethod === 'Cash' ? parseFloat(paymentDetails.receivedAmount) : parseFloat(paymentDetails.payingAmount || roundedTotal),
        paying_amt: parseFloat(paymentDetails.payingAmount || roundedTotal),
        change: paymentMethod === 'Cash' ? paymentDetails.change : 0,
        payment_receiver: paymentDetails.paymentReceiver,
        payment_note: paymentDetails.paymentNote,
        gift_card_code: paymentMethod === 'Gift Card' ? paymentDetails.giftCardCode : null
      }];

      const saleData = {
        invoice_no: `INV-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        patient_id: customer,
        total_amount: subtotal,
        discount: discount,
        discount_type: discountType === 'flat' ? 'Flat' : 'Percent',
        grand_total: finalTotal,
        round_off: roundOffEnabled ? roundOff : 0,
        delivery_charge: deliveryCharge,
        payment: paymentData,
        created_by: 1,
        created_at: new Date().toISOString(),
        items: cart.map(item => ({
          product_variation_id: item.id,
          quantity: item.qty,
          unit_price: item.price,
          subtotal: item.price * item.qty
        }))
      };
  
      console.log('Submitting sale data to backend:', JSON.stringify(saleData, null, 2));
  
      const response = await fetch('https://bkdemo1.clinicpro.cc/pos/create-sale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(saleData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create sale');
      }
  
      const result = await response.json();
      console.log(`Backend response: //////////////////////////////////////////////////////// ${result} , ${token} , ///////////////////////////////////////////////////////// \n ${JSON.stringify(saleData, null, 2)} ` );
      
      cart.forEach(item => {
        const medIdx = medicines.findIndex(m => m.id === item.medId);
        if (medIdx !== -1) {
          const med = { ...medicines[medIdx] };
          const variation = { ...med.variations[item.variationIdx] };
          variation.stock = String(Math.max(0, Number(variation.stock) - item.qty));
          med.variations[item.variationIdx] = variation;
        }
      });
  
      toast.success('Sale completed successfully!');
      
      if (currentDraftId) {
        removeDraft(currentDraftId);
      }
      
      clearCurrentSession();
      setShowQRCode(false);
      setLoading(false);
      
      const invoiceId = result.data?.id || result.invoice_id;
      navigate(`/pharmacy/invoices/${invoiceId}`);
  
    } catch (error) {
      console.error('Error submitting sale:', error);
      // toast.error(error.message || 'Failed to complete sale. Please try again.');
      setLoading(false);
    }
  };

  // Remove draft from localStorage
  const removeDraft = (draftId) => {
    const updatedDrafts = drafts.filter(draft => draft.id !== draftId);
    localStorage.setItem('posDrafts', JSON.stringify(updatedDrafts));
    setDrafts(updatedDrafts);
  };

  // Barcode handler
  const handleBarcodeEnter = (e) => {
    if (e.key === 'Enter' && barcode.trim()) {
      if (!customer) {
        setCustomerError(true);
        toast.error('Please select a customer first');
        customerSearchRef.current?.focus();
        return;
      }

      processBarcodeSearch(barcode);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      if (e.key === '/') {
        e.preventDefault();
        barcodeRef.current?.focus();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchRef.current?.focus();
        setHasSearched(true);
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        handleCheckout();
      } else if (e.ctrlKey && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        customerSearchRef.current?.focus();
      } else if (e.ctrlKey && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setShowDraftDialog(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        setShowDraftsList(true);
      } else if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        openCameraScanner();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [customer]);

  // Payment method icons with colors
  const getPaymentIcon = (method) => {
    switch (method) {
      case 'Cash': return <FaMoneyBillWave className="me-2 text-success" />;
      case 'Card': return <FaCard className="me-2 text-primary" />;
      case 'UPI': return <FaMobileAlt className="me-2 text-info" />;
      case 'Gift Card': return <FaGift className="me-2 text-warning" />;
      default: return <FaCreditCard className="me-2" />;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

// Update the renderPaymentFields function to make paying amount auto-filled and unchangeable:
const renderPaymentFields = (finalTotal) => {
  switch (paymentMethod) {
    case 'Cash':
      return (
        <div className="payment-fields">
          <div className="row g-2">
            <div className="col-4">
              <label className="form-label small fw-bold mb-1">
                <FaMoneyBillWave className="me-1 text-success" />
                Received Amount *
              </label>
              <input
                type="text"
                className="form-control form-control-sm p-2 px-3"
                value={paymentDetails.receivedAmount}
                onChange={(e) => handlePaymentDetailChange('receivedAmount', e.target.value, finalTotal)}
                placeholder="Enter amount received"
                min={finalTotal}
                step="0.01"
              />
            </div>
            <div className="col-4">
              <label className="form-label small fw-bold mb-1">
                <FaFileInvoiceDollar className="me-1 text-primary" />
                Paying Amount *
              </label>
              <input
                type="number"
                className="form-control form-control-sm p-2 text-center"
                value={finalTotal.toFixed(2)}
                readOnly
                style={{backgroundColor: '#f8f9fa', fontWeight: 'bold'}}
              />
            </div>
            <div className="col-4">
              <label className="form-label small fw-bold mb-1 text-success">
                <FaExchangeAlt className="me-1" />
                Change
              </label>
              <input
                type="number"
                className="form-control form-control-sm p-2 text-center"
                value={paymentDetails.change.toFixed(2)}
                readOnly
                style={{backgroundColor: '#f8f9fa'}}
              />
            </div>
          </div>
        </div>
      );
    
    case 'Card':
    case 'UPI':
      return (
        <div className="payment-fields">
          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label small fw-bold mb-1">
                <FaFileInvoiceDollar className="me-1 text-primary" />
                Paying Amount *
              </label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={finalTotal.toFixed(2)}
                readOnly
                style={{backgroundColor: '#f8f9fa', fontWeight: 'bold'}}
              />
            </div>
            <div className="col-md-8">
              <label className="form-label small fw-bold mb-1">Transaction ID</label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={paymentDetails.transactionId}
                readOnly
                style={{backgroundColor: '#f8f9fa', fontWeight: 'bold'}}
              />
            </div>
          </div>
        </div>
      );
    
    case 'Gift Card':
      return (
        <div className="payment-fields">
          <div className="row g-2">
            <div className="col-4">
              <label className="form-label small fw-bold mb-1">
                <FaFileInvoiceDollar className="me-1 text-primary" />
                Paying Amount *
              </label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={finalTotal.toFixed(2)}
                readOnly
                style={{backgroundColor: '#f8f9fa', fontWeight: 'bold'}}
              />
            </div>
            <div className="col-8">
              <label className="form-label small fw-bold mb-1">
                <FaGift className="me-1 text-warning" />
                Gift Card Code *
              </label>
              <input
                type="text"
                className="form-control form-control-sm"
                value={paymentDetails.giftCardCode}
                onChange={(e) => handlePaymentDetailChange('giftCardCode', e.target.value)}
                placeholder="Enter gift card code"
              />
            </div>
          </div>
        </div>
      );
    
    default:
      return null;
  }
};
const DeliveryChargeModal = ({
  showDeliveryChargeEdit,
  setShowDeliveryChargeEdit,
  deliveryCharge,
  setDeliveryCharge
}) => {
  const [tempDeliveryCharge, setTempDeliveryCharge] = useState(deliveryCharge);

  const handleSave = () => {
    setDeliveryCharge(tempDeliveryCharge);
    setShowDeliveryChargeEdit(false);
  };

  return (
    <div className={`modal fade ${showDeliveryChargeEdit ? 'show d-block' : ''}`} style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title d-flex align-items-center">
              <FaTruck className="me-2 text-secondary" />
              Edit Delivery Charge
            </h5>
            <button 
              type="button" 
              className="btn-close" 
              onClick={() => setShowDeliveryChargeEdit(false)}
            ></button>
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <label className="form-label">Delivery Charge Amount (₹)</label>
              <input
                type="number"
                className="form-control"
                value={tempDeliveryCharge}
                onChange={(e) => setTempDeliveryCharge(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                placeholder="Enter delivery charge"
              />
              <div className="form-text">
                Enter the delivery charge amount. This will be added after all discounts.
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => setShowDeliveryChargeEdit(false)}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-primary" 
              onClick={handleSave}
            >
              Save Delivery Charge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

  // Common payment fields for all methods
  const renderCommonPaymentFields = () => (
    <div className="common-fields mt-2">
         <label className="form-label small fw-bold mb-1">
           <FaReceipt className="me-1 text-secondary" />
           Payment Note
         </label>
         <textarea
           className="form-control form-control-sm"
           rows="1"
           value={paymentDetails.paymentNote}
           onChange={(e) => handlePaymentDetailChange('paymentNote', e.target.value)}
           placeholder="Additional payment notes..."
         />
      </div>
  );

  return (
    <>
      <PageHeader />
      
      <div className="container-fluid mt-3">
        <div className="row g-3">
          
          {/* Left Column - Medicine Search & Table */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header py-3 d-flex justify-content-between align-items-center" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <h4 className="mb-0 text-white">
                  <FaCapsules className="me-2" />
                  Medicine Catalog
                  {currentDraftId && (
                    <span className="badge bg-warning text-dark ms-2">
                      Draft Loaded
                    </span>
                  )}
                </h4>
                <div className="d-flex gap-2">
                  {/* View Prescriptions Button - Only show when customer is selected */}
                  {customer && patientPrescriptions.length > 0 && (
                    <button
                      className="btn btn-outline-light btn-sm d-flex align-items-center"
                      onClick={() => setShowPrescriptions(true)}
                      title="View patient prescriptions"
                    >
                      <FaFileMedical className="me-1" />
                      Prescriptions ({patientPrescriptions.length})
                    </button>
                  )}
                  <button
                    className="btn btn-outline-light btn-sm d-flex align-items-center"
                    onClick={() => setShowDraftsList(true)}
                    title="View saved drafts"
                  >
                    <FaFolderOpen className="me-1" /> 
                    Drafts ({drafts.length})
                  </button>
                </div>
              </div>
              
              <div className="card-body">
                {/* Search Section */}
                <div className="row g-3 mb-4">
                  {/* Medicine Search */}
                  <div className="col-md-4 position-relative">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaSearch className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Search by name, brand or SKU..."
                        value={search}
                        onChange={handleSearchChange}
                        onFocus={() => setShowMedicineDropdown(true)}
                        onBlur={() => setTimeout(() => setShowMedicineDropdown(false), 200)}
                        ref={searchRef}
                        disabled={!customer} // Disable if no customer selected
                      />
                    </div>
                    <small className="text-muted">
                      <FaKey className="me-1" />
                      Press Ctrl+F to focus here
                    </small>
                    
                    {/* Medicine Dropdown */}
                    {showMedicineDropdown && filteredMedicines.length > 0 && customer && (
                      <div className="position-absolute w-100 z-3">
                        <div className="card shadow-sm border">
                          <div className="card-body p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {filteredMedicines.map(medicine => (
                              <div
                                key={medicine.id}
                                className="py-2 hover-bg-light"
                                style={{ borderBottom: '1px dotted #dee2e6' , cursor: 'pointer' , lineHeight: '1.1' }}
                                onClick={() => {
                                  setSearch(medicine.name);
                                  setHasSearched(true);
                                  setShowMedicineDropdown(false);
                                }}
                              >
                                <div className="fw-semibold">{medicine.name}</div>
                                <small className="text-muted">
                                  {medicine.brand} • {medicine.variations[0]?.sku}
                                </small>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                
                  {/* Barcode Search */}
                  <div className="col-md-5 position-relative">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaBarcode className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className="form-control border-start-0"
                        placeholder="Scan Barcode or Enter SKU..."
                        value={barcode}
                        onChange={handleBarcodeInputChange}
                        onKeyDown={handleBarcodeEnter}
                        onFocus={() => setShowBarcodeDropdown(true)}
                        onBlur={() => setTimeout(() => setShowBarcodeDropdown(false), 200)}
                        ref={barcodeRef}
                        disabled={!customer} // Disable if no customer selected
                      />
                      
                      {/* Camera Scanner Button */}
                      <button
                        className="btn btn-outline-primary"
                        onClick={openCameraScanner}
                        title="Open Camera Scanner (Ctrl+C)"
                        type="button"
                        disabled={!customer} // Disable if no customer selected
                      >
                        <FaCamera />
                      </button>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <small className="text-muted">
                        <FaKey className="me-1" />
                        Press '/' to focus • Type & press Enter
                      </small>
                      
                      <small className="text-success">
                        <FaKeyboard className="me-1" />
                        Manual input available
                      </small>
                    </div>

                    {/* Barcode Dropdown */}
                    {showBarcodeDropdown && filteredBarcodeMedicines.length > 0 && customer && (
                      <div className="position-absolute w-100 z-3">
                        <div className="card shadow-sm border mb-0">
                          <div className="card-body p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {filteredBarcodeMedicines.map(medicine => (
                              <div
                                key={medicine.id}
                                className="py-2 hover-bg-light"
                                style={{
                                  borderBottom: '1px dotted #dee2e6',
                                  cursor: 'pointer',
                                  lineHeight: '1.1'
                                }}
                                onClick={() => {
                                  setBarcode(medicine.variations[0]?.sku || medicine.name);
                                  setShowBarcodeDropdown(false);
                                }}
                              >
                                {/* Name + Price */}
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <div className="fw-semibold">{medicine.name}</div>
                        
                                    <div className="fw-semibold text-success text-end">
                                      ₹{medicine.variations[0]?.price}
                                    </div>
                                </div>
                        
                                {/* SKU row */}
                                <small className="text-muted d-flex justify-content-between align-items-center">
                                  <span><FaBarcode className=""/> {medicine.variations[0]?.sku}</span>
                                  <span>
                                    {medicine.variations[0]?.stock}
                                    {medicine.variations[0]?.unit}
                                  </span>
                                </small>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Customer Search - MANDATORY FIELD */}
                  <div className="col-md-3 position-relative">
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <FaUser className="text-muted" />
                      </span>
                      <input
                        type="text"
                        className={`form-control border-start-0 ${customerError ? 'is-invalid' : ''}`}
                        placeholder="Search customer by name, phone... *"
                        value={customer ? patients.find(p => p.id === customer)?.name : customerSearch}
                        onChange={e => {
                          setCustomerSearch(e.target.value);
                          setCustomer('');
                          setCustomerError(false);
                          // Reset search state when customer changes
                          if (customer) {
                            setSearch('');
                            setHasSearched(false);
                          }
                        }}
                        onFocus={() => setShowCustomerDropdown(true)}
                        onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
                        ref={customerSearchRef}
                        required
                      />
                    </div>
                    {customerError && (
                      <div className="invalid-feedback d-block">
                        Please select a customer to continue
                      </div>
                    )}
                    <small className="text-muted">
                      <FaKey className="me-1" />
                      Press Ctrl+P to focus here • Required
                    </small>
                       
                    {/* Customer dropdown */}
                    {showCustomerDropdown && filteredPatients.length > 0 && (
                      <div className="position-absolute w-100 z-3">
                        <div className="card shadow-sm border">
                          <div className="card-body p-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {filteredPatients.map(patient => (
                              <div
                                key={patient.id}
                                className={`p-2 cursor-pointer rounded ${customer === patient.id ? 'bg-primary text-white' : 'hover-bg-light'}`}
                                onClick={() => {
                                  setCustomer(patient.id);
                                  setCustomerSearch(patient.name);
                                  setShowCustomerDropdown(false);
                                  setCustomerError(false);
                                  // Focus on search after selecting customer
                                  setTimeout(() => {
                                    searchRef.current?.focus();
                                  }, 100);
                                }}
                                style={{ cursor: 'pointer' }}
                              >
                                <div className="fw-semibold">{patient.name}</div>
                                {patient.phone && (
                                  <small className={customer === patient.id ? 'text-white-50' : 'text-muted'}>
                                    {patient.phone}
                                  </small>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Medicine Display Section */}
                {!customer ? (
                  /* Placeholder when no customer selected */
                  <div className="d-flex flex-column justify-content-center align-items-center border rounded bg-light h-75">
                    <div className="text-center">
                      <FaUser size={48} className="text-muted opacity-50" />
                      <h5 className="text-muted mt-3">Select Customer First</h5>
                      <p className="text-muted small mb-3">
                        Please select a customer from the search field above to enable medicine search
                      </p>
                      <button 
                        className="btn btn-primary m-auto"
                        onClick={() => {
                          customerSearchRef.current?.focus();
                          setShowCustomerDropdown(true);
                        }}
                      >
                        <FaUser className="me-2" />
                        Select Customer
                      </button>
                      <div className="mt-2">
                        <small className="text-muted">
                          <FaKey className="me-1" />
                          Keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>P</kbd>
                        </small>
                      </div>
                    </div>
                  </div>
                ) : !hasSearched ? (
                  /* Placeholder when customer selected but no search made */
                  <div className="d-flex flex-column justify-content-center align-items-center border rounded bg-light h-75">
                    <div className="text-center">
                      <FaSearch size={48} className="text-muted opacity-50" />
                      <h5 className="text-muted mt-3">Search Medicines</h5>
                      <p className="text-muted small mb-3">
                        Enter a medicine name, brand, or SKU in the search field above to browse medicines
                      </p>
                      <button 
                        className="btn btn-primary m-auto"
                        onClick={() => {
                          searchRef.current?.focus();
                          setShowMedicineDropdown(true);
                        }}
                      >
                        <FaSearch className="me-2" />
                        Start Searching
                      </button>
                      <div className="mt-2">
                        <small className="text-muted">
                          <FaKey className="me-1" />
                          Keyboard shortcut: <kbd>Ctrl</kbd> + <kbd>F</kbd>
                        </small>
                      </div>
                      <div className="mt-2">
                        <small className="text-muted">
                          Or scan a barcode using the barcode scanner
                        </small>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Display medicines only when customer is selected AND search has been made */
                  <>
                    {/* View Mode Toggle and Medicine Type Quick Filters */}
                    <div className="row g-2 mb-3">
                      <div className="col-md-8">
                        <div className="d-flex flex-wrap gap-2">
                          {medicineTypes.map((type, index) => (
                            <button
                              key={index}
                              className={`btn btn-sm ${
                                selectedMedicineType === type ? 'btn-primary' : 'btn-outline-primary'
                              }`}
                              onClick={() => {
                                setSelectedMedicineType(type);
                                setPage(1);
                              }}
                            >
                              {type === "All" ? "All Types" : type}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="col-md-4  d-flex justify-content-end">
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center`}
                              onClick={() => setViewMode('table')}
                            >
                              <FaList className="me-1" />
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${viewMode === 'card' ? 'btn-primary' : 'btn-outline-primary'} d-flex align-items-center`}
                              onClick={() => setViewMode('card')}
                            >
                              <FaTh className="me-1" />
                            </button>
                          </div>
                      </div>
                    </div>

                    {/* Medicine Display Content */}
                    {loading ? (
                      <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading medicines...</p>
                      </div>
                    ) : (
                      <>
                        {/* Medicine Table/Cards */}
                        {viewMode === 'table' ? (
                          <MedicineTable
                            paginated={paginated}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            getSortIcon={getSortIcon}
                            onAddToCart={addToCart}
                          />
                        ) : (
                          <MedicineCards
                            paginated={paginated}
                            onAddToCart={addToCart}
                          />
                        )}

                        {/* Pagination - Only show when customer selected AND medicines exist */}
                        {totalPages > 1 && (
                          <div className="d-flex justify-content-between mt-4 mx-3">
                            <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                              Showing {((page - 1) * PAGE_SIZE) + 1} to {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} medicines
                            </small>
                        
                            <nav>
                              <ul className="pagination pagination-sm mb d-flex align-items-center" >
                                <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                  <button 
                                    className="page-link"
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                  >
                                    Previous
                                  </button>
                                </li>
                        
                                <span className="mx-2 btn btn-md btn-primary py-2">
                                  Page {page} of {totalPages}
                                </span>
                        
                                <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                                  <button 
                                    className="page-link"
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                  >
                                    Next
                                  </button>
                                </li>
                              </ul>
                            </nav>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Using MedicineCart Component */}
          <div className="col-lg-4">
            <MedicineCart
              cart={cart}
              currentDraftId={currentDraftId}
              subtotal={subtotal}
              discount={discount}
              discountType={discountType}
              discountValue={discountValue}
              deliveryCharge={deliveryCharge}
              setShowDeliveryChargeEdit={setShowDeliveryChargeEdit}
              roundOffEnabled={roundOffEnabled}
              roundOff={roundOff}
              roundedTotal={roundedTotal}
              paymentMethod={paymentMethod}
              paymentDetails={paymentDetails}
              paymentMethods={paymentMethods}
              loading={loading}
              customer={customer}
              patients={patients}
              removeFromCart={removeFromCart}
              updateQty={updateQty}
              clearCart={clearCart}
              setShowDiscountEdit={setShowDiscountEdit}
              setRoundOffEnabled={setRoundOffEnabled}
              setPaymentMethod={setPaymentMethod}
              handlePaymentDetailChange={handlePaymentDetailChange}
              setShowDraftDialog={setShowDraftDialog}
              handleCheckout={handleCheckout}
              renderPaymentFields={renderPaymentFields}
              renderCommonPaymentFields={renderCommonPaymentFields}
            />
          </div>
        </div>
      </div>

      {/* Modal Components */}
      <PrescriptionsModal
        showPrescriptions={showPrescriptions}
        setShowPrescriptions={setShowPrescriptions}
        prescriptionLoading={prescriptionLoading}
        patientPrescriptions={patientPrescriptions}
        customer={customer}
        patients={patients}
        addPrescriptionToCart={addPrescriptionToCart}
        addSingleMedicineFromPrescription={addSingleMedicineFromPrescription}
        formatPrescriptionDate={formatPrescriptionDate}
        formatDate={formatDate}
      />

      <DeliveryChargeModal
        showDeliveryChargeEdit={showDeliveryChargeEdit}
        setShowDeliveryChargeEdit={setShowDeliveryChargeEdit}
        deliveryCharge={deliveryCharge}
        setDeliveryCharge={setDeliveryCharge}
      />

      <DiscountEditModal
        showDiscountEdit={showDiscountEdit}
        setShowDiscountEdit={setShowDiscountEdit}
        discountType={discountType}
        setDiscountType={setDiscountType}
        discountValue={discountValue}
        setDiscountValue={setDiscountValue}
      />

      <SaveDraftModal
        showDraftDialog={showDraftDialog}
        setShowDraftDialog={setShowDraftDialog}
        saveToDraft={saveToDraft}
        customer={customer}
        patients={patients}
        cart={cart}
        roundedTotal={roundedTotal}
      />

      <DraftListModal
        showDraftsList={showDraftsList}
        setShowDraftsList={setShowDraftsList}
        drafts={drafts}
        loadDraft={loadDraft}
        deleteDraft={deleteDraft}
        formatDate={formatDate}
        toast={toast}
        setDrafts={setDrafts}
      />

      <CheckoutConfirmModal
        checkoutDialog={checkoutDialog}
        setCheckoutDialog={setCheckoutDialog}
        showQRCode={showQRCode}
        setShowQRCode={setShowQRCode}
        cart={cart}
        customer={customer}
        patients={patients}
        paymentMethod={paymentMethod}
        paymentDetails={paymentDetails}
        roundOffEnabled={roundOffEnabled}
        roundOff={roundOff}
        finalTotal={finalTotal}
        confirmCheckout={confirmCheckout}
        getPaymentIcon={getPaymentIcon}
      />

      {/* Camera Scanner Modal */}
      <CameraScannerModal
        showCameraScanner={showCameraScanner}
        setShowCameraScanner={setShowCameraScanner}
        isCameraActive={isCameraActive}
        cameraPermission={cameraPermission}
        selectedCamera={selectedCamera}
        availableCameras={availableCameras}
        videoRef={videoRef}
        startCamera={startCamera}
        stopCamera={stopCamera}
        setSelectedCamera={setSelectedCamera}
        getAvailableCameras={getAvailableCameras}
      />
    </>
  );
};

export default POSTerminal;