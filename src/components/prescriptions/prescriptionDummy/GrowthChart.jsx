import React, { useMemo, useState, useEffect, useCallback } from 'react';
import ReactApexChart from 'react-apexcharts';
import { FiTrendingUp } from 'react-icons/fi';
import { usePrescription } from '../../../contentApi/PrescriptionProvider';
import { format } from 'date-fns';

// Parentlane Infant Growth Reference Data (0-12 months)
// Data source: Parentlane growth charts
const growthData = {
  boys: {
    weight: [
      { month: 0, min: 2.5, max: 4.3 },   // 0 months
      { month: 1, min: 3.4, max: 5.7 },   // 1 month
      { month: 2, min: 4.4, max: 7.0 },   // 2 months
      { month: 3, min: 5.1, max: 7.9 },    // 3 months
      { month: 4, min: 5.6, max: 8.6 },   // 4 months
      { month: 5, min: 6.1, max: 9.2 },   // 5 months
      { month: 6, min: 6.4, max: 9.7 },   // 6 months
      { month: 7, min: 6.7, max: 10.2 },  // 7 months
      { month: 8, min: 7.0, max: 10.5 },  // 8 months
      { month: 9, min: 7.2, max: 10.9 },  // 9 months
      { month: 10, min: 7.5, max: 11.2 },  // 10 months
      { month: 11, min: 7.4, max: 11.5 }, // 11 months
      { month: 12, min: 7.8, max: 11.8 },  // 12 months
    ],
    height: [
      { month: 0, min: 46.3, max: 53.4 },
      { month: 1, min: 51.1, max: 58.4 },
      { month: 2, min: 54.7, max: 62.2 },
      { month: 3, min: 57.6, max: 65.3 },
      { month: 4, min: 60.0, max: 67.8 },
      { month: 5, min: 61.9, max: 69.9 },
      { month: 6, min: 63.6, max: 71.6 },
      { month: 7, min: 65.1, max: 73.2 },
      { month: 8, min: 66.5, max: 74.7 },
      { month: 9, min: 67.7, max: 76.2 },
      { month: 10, min: 67.7, max: 76.2 },
      { month: 11, min: 70.2, max: 78.9 },
      { month: 12, min: 71.3, max: 80.2 },
    ],
    headCircumference: [
      { month: 0, min: 31.9, max: 36.2 },
      { month: 1, min: 34.9, max: 39.1 },
      { month: 2, min: 37.0, max: 41.3 },
      { month: 3, min: 38.5, max: 42.9 },
      { month: 4, min: 39.7, max: 44.2 },
      { month: 5, min: 40.6, max: 45.2 },
      { month: 6, min: 41.5, max: 46.1 },
      { month: 7, min: 42.2, max: 46.9 },
      { month: 8, min: 42.8, max: 47.6 },
      { month: 9, min: 43.3, max: 48.2 },
      { month: 10, min: 43.8, max: 48.7 },
      { month: 11, min: 44.2, max: 49.1 },
      { month: 12, min: 44.5, max: 49.5 },
    ],
  },
  girls: {
    weight: [
      { month: 0, min: 2.4, max: 4.2 },
      { month: 1, min: 3.2, max: 5.4 },
      { month: 2, min: 4.0, max: 6.5 },
      { month: 3, min: 4.6, max: 7.4 },
      { month: 4, min: 5.1, max: 8.1 },
      { month: 5, min: 5.5, max: 8.7 },
      { month: 6, min: 5.8, max: 9.2 },
      { month: 7, min: 6.1, max: 9.6 },
      { month: 8, min: 6.3, max: 10.0 },
      { month: 9, min: 6.6, max: 10.4 },
      { month: 10, min: 6.8, max: 10.7 },
      { month: 11, min: 7.0, max: 11.0 },
      { month: 12, min: 7.1, max: 11.3 },
    ],
    height: [
      { month: 0, min: 45.6, max: 52.7 },
      { month: 1, min: 50.0, max: 57.4 },
      { month: 2, min: 53.2, max: 60.9 },
      { month: 3, min: 55.8, max: 63.8 },
      { month: 4, min: 58.0, max: 66.2 },
      { month: 5, min: 59.9, max: 68.2 },
      { month: 6, min: 61.5, max: 70.0 },
      { month: 7, min: 62.9, max: 71.6 },
      { month: 8, min: 64.3, max: 73.2 },
      { month: 9, min: 65.6, max: 74.7 },
      { month: 10, min: 66.8, max: 76.1 },
      { month: 11, min: 68.0, max: 77.5 },
      { month: 12, min: 69.2, max: 78.9 },
    ],
    headCircumference: [
      { month: 0, min: 31.2, max: 35.4 },
      { month: 1, min: 34.2, max: 38.3 },
      { month: 2, min: 36.1, max: 40.3 },
      { month: 3, min: 37.5, max: 41.8 },
      { month: 4, min: 38.6, max: 43.0 },
      { month: 5, min: 39.5, max: 44.0 },
      { month: 6, min: 40.3, max: 44.9 },
      { month: 7, min: 41.0, max: 45.6 },
      { month: 8, min: 41.6, max: 46.3 },
      { month: 9, min: 42.1, max: 46.8 },
      { month: 10, min: 42.5, max: 47.3 },
      { month: 11, min: 42.9, max: 47.7 },
      { month: 12, min: 43.2, max: 48.1 },
    ],
  },
};

// Interpolate value between two points
const interpolate = (x, x1, y1, x2, y2) => {
  if (x2 === x1) return y1;
  return y1 + ((y2 - y1) * (x - x1)) / (x2 - x1);
};

// Get percentile data based on actual Parentlane growth data
const getPercentileData = (ageInDays, type, gender = 'male') => {
  const maxAge = 365; // 12 months in days
  if (ageInDays > maxAge) {
    // Extend beyond 12 months with linear extrapolation
    const ageInMonths = ageInDays / 30.44;
    const genderKey = gender?.toLowerCase().includes('female') || gender?.toLowerCase().includes('girl') ? 'girls' : 'boys';
    const data = growthData[genderKey][type];
    if (!data || data.length === 0) return null;
    
    const lastPoint = data[data.length - 1];
    const secondLastPoint = data[data.length - 2];
    
    // Calculate growth rate from last two points
    const monthDiff = lastPoint.month - secondLastPoint.month;
    const minGrowthRate = (lastPoint.min - secondLastPoint.min) / monthDiff;
    const maxGrowthRate = (lastPoint.max - secondLastPoint.max) / monthDiff;
    const medianGrowthRate = ((lastPoint.min + lastPoint.max) / 2 - (secondLastPoint.min + secondLastPoint.max) / 2) / monthDiff;
    
    const monthsBeyond = ageInMonths - lastPoint.month;
    const min = lastPoint.min + (minGrowthRate * monthsBeyond);
    const max = lastPoint.max + (maxGrowthRate * monthsBeyond);
    const median = (lastPoint.min + lastPoint.max) / 2 + (medianGrowthRate * monthsBeyond);
    
    // Calculate percentiles (assuming min=3rd, max=97th, median=50th)
    const p15 = min + (median - min) * 0.3;
    const p85 = median + (max - median) * 0.3;
    
    return {
      3: min,
      15: p15,
      50: median,
      85: p85,
      97: max,
    };
  }
  
  const ageInMonths = ageInDays / 30.44; // Average days per month
  const genderKey = gender?.toLowerCase().includes('female') || gender?.toLowerCase().includes('girl') ? 'girls' : 'boys';
  const data = growthData[genderKey][type];
  
  if (!data || data.length === 0) return null;
  
  // Handle edge cases
  if (ageInMonths <= 0) {
    const first = data[0];
    const median = (first.min + first.max) / 2;
    const p15 = first.min + (median - first.min) * 0.3;
    const p85 = median + (first.max - median) * 0.3;
    return {
      3: first.min,
      15: p15,
      50: median,
      85: p85,
      97: first.max,
    };
  }
  
  if (ageInMonths >= data[data.length - 1].month) {
    const last = data[data.length - 1];
    const median = (last.min + last.max) / 2;
    const p15 = last.min + (median - last.min) * 0.3;
    const p85 = median + (last.max - median) * 0.3;
    return {
      3: last.min,
      15: p15,
      50: median,
      85: p85,
      97: last.max,
    };
  }
  
  // Find the two data points to interpolate between
  let lowerIndex = 0;
  let upperIndex = data.length - 1;
  
  for (let i = 0; i < data.length - 1; i++) {
    if (ageInMonths >= data[i].month && ageInMonths <= data[i + 1].month) {
      lowerIndex = i;
      upperIndex = i + 1;
      break;
    }
  }
  
  const lower = data[lowerIndex];
  const upper = data[upperIndex];
  
  // Interpolate min, max, and calculate percentiles
  const min = interpolate(ageInMonths, lower.month, lower.min, upper.month, upper.min);
  const max = interpolate(ageInMonths, lower.month, lower.max, upper.month, upper.max);
  const median = (min + max) / 2;
  
  // Calculate percentiles (assuming min=3rd, max=97th, median=50th)
  const p15 = min + (median - min) * 0.3;
  const p85 = median + (max - median) * 0.3;
  
  return {
    3: min,
    15: p15,
    50: median,
    85: p85,
    97: max,
  };
};

const GrowthChart = () => {
  const { prescriptionFormData } = usePrescription();
  const patient = prescriptionFormData?.patient;
  
  // Get current measurements
  const height = prescriptionFormData?.height || patient?.height || '';
  const weight = prescriptionFormData?.weight || patient?.weight || '';
  const headCircumference = prescriptionFormData?.headCircumference || patient?.headCircumference || '';
  const age = prescriptionFormData?.age || patient?.patientAge || patient?.age || '';
  const gender = patient?.gender || 'male';
  
  // Growth history state
  const [growthHistory, setGrowthHistory] = useState([]);
  
  // Load growth history from localStorage (or API in production)
  useEffect(() => {
    if (patient?.id) {
      const stored = localStorage.getItem(`growth_history_${patient.id}`);
      if (stored) {
        try {
          setGrowthHistory(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing growth history:', e);
        }
      }
    }
  }, [patient?.id]);
  
  // Calculate age in days from age string (handles years, months, or days)
  const calculateAgeInDays = (ageStr) => {
    if (!ageStr) return 0;
    const ageNum = parseFloat(ageStr);
    if (isNaN(ageNum)) return 0;
    
    // If age is less than 3, assume it's in years (convert to days)
    // If age is between 3 and 24, assume it's in months (convert to days)
    // Otherwise assume it's already in days
    if (ageNum < 3) {
      return Math.round(ageNum * 365);
    } else if (ageNum <= 24) {
      return Math.round(ageNum * 30);
    } else {
      return Math.round(ageNum);
    }
  };
  
  // Format age display
  const formatAge = (ageInDays) => {
    if (ageInDays < 30) {
      return `${ageInDays}d`;
    } else if (ageInDays < 365) {
      const months = Math.floor(ageInDays / 30);
      const days = ageInDays % 30;
      return days > 0 ? `${months}m ${days}d` : `${months}m`;
    } else {
      const years = Math.floor(ageInDays / 365);
      const months = Math.floor((ageInDays % 365) / 30);
      return months > 0 ? `${years}y ${months}m` : `${years}y`;
    }
  };
  
  // Add current measurement to history when form data changes
  useEffect(() => {
    if (height && weight && age && patient?.id) {
      const ageInDays = calculateAgeInDays(age);
      const newRecord = {
        date: format(new Date(), 'M/d/yyyy'),
        ageInDays: ageInDays,
        ageFormatted: formatAge(ageInDays),
        weight: parseFloat(weight),
        height: parseFloat(height),
        headCircumference: headCircumference ? parseFloat(headCircumference) : null,
        weightPercentile: calculatePercentile(parseFloat(weight), ageInDays, 'weight', gender),
        heightPercentile: calculatePercentile(parseFloat(height), ageInDays, 'height', gender),
        headCircumferencePercentile: headCircumference ? calculatePercentile(parseFloat(headCircumference), ageInDays, 'headCircumference', gender) : null,
        notes: ''
      };
      
      // Check if this record already exists (same date)
      setGrowthHistory(prev => {
        const existingIndex = prev.findIndex(r => r.date === newRecord.date);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newRecord;
          localStorage.setItem(`growth_history_${patient.id}`, JSON.stringify(updated));
          return updated;
        } else if (prev.length === 0 || prev[prev.length - 1].date !== newRecord.date) {
          const updated = [...prev, newRecord];
          localStorage.setItem(`growth_history_${patient.id}`, JSON.stringify(updated));
          return updated;
        }
        return prev;
      });
    }
  }, [height, weight, headCircumference, age, patient?.id, gender]);
  
  // Calculate percentile (simplified - use actual WHO data in production)
  const calculatePercentile = (value, ageInDays, type, gender) => {
    const percentiles = getPercentileData(ageInDays, type, gender);
    if (!percentiles) return null;
    
    if (value <= percentiles[3]) return 3;
    if (value <= percentiles[15]) return 15;
    if (value <= percentiles[50]) return 50;
    if (value <= percentiles[85]) return 85;
    if (value <= percentiles[97]) return 97;
    return 97;
  };
  
  // Prepare chart data
  const chartData = useMemo(() => {
    // If we have current data but no history, create a single data point
    if (growthHistory.length === 0 && height && weight && age) {
      const ageInDays = calculateAgeInDays(age);
      const singleRecord = {
        ageInDays,
        weight: parseFloat(weight),
        height: parseFloat(height),
        headCircumference: headCircumference ? parseFloat(headCircumference) : null,
      };
      
      // Generate age points in months (0 to 24 months)
      const agePoints = Array.from({ length: 25 }, (_, i) => i);
      
      const weightPercentiles = {
        p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[3] || null),
        p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[15] || null),
        p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[50] || null),
        p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[85] || null),
        p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[97] || null),
      };
      
      const heightPercentiles = {
        p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[3] || null),
        p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[15] || null),
        p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[50] || null),
        p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[85] || null),
        p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[97] || null),
      };
      
      const headCircumferencePercentiles = {
        p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[3] || null),
        p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[15] || null),
        p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[50] || null),
        p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[85] || null),
        p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[97] || null),
      };
      
      return {
        agePoints,
        sortedHistory: [singleRecord],
        weightPercentiles,
        heightPercentiles,
        headCircumferencePercentiles,
      };
    }
    
    if (growthHistory.length === 0) return null;
    
    const sortedHistory = [...growthHistory].sort((a, b) => a.ageInDays - b.ageInDays);
    const maxAgeInDays = Math.max(...sortedHistory.map(h => h.ageInDays), 720);
    const maxAgeInMonths = Math.min(Math.ceil(maxAgeInDays / 30.44), 24);
    
    // Generate percentile curves in months (0 to 24 months)
    const agePoints = Array.from({ length: maxAgeInMonths + 1 }, (_, i) => i);
    
    const weightPercentiles = {
      p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[3] || null),
      p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[15] || null),
      p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[50] || null),
      p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[85] || null),
      p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[97] || null),
    };
    
    const heightPercentiles = {
      p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[3] || null),
      p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[15] || null),
      p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[50] || null),
      p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[85] || null),
      p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[97] || null),
    };
    
    const headCircumferencePercentiles = {
      p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[3] || null),
      p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[15] || null),
      p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[50] || null),
      p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[85] || null),
      p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[97] || null),
    };
    
    return {
      agePoints,
      sortedHistory,
      weightPercentiles,
      heightPercentiles,
      headCircumferencePercentiles,
    };
  }, [growthHistory, gender, height, weight, age, headCircumference]);
  
  // Chart options
  const getChartOptions = (title, color, yAxisMin, yAxisMax, yAxisStep, percentileColors) => ({
    chart: {
      type: 'line',
      height: 350,
      toolbar: { show: false },
      zoom: { enabled: false },
      sparkline: { enabled: false },
    },
    colors: percentileColors,
    stroke: {
      width: [1.5, 1.5, 1.5, 1.5, 1.5],
      curve: 'smooth',
      dashArray: [5, 5, 5, 5, 5],
    },
    xaxis: {
      title: { 
        text: 'Age (Months)',
        style: { fontSize: '12px', fontWeight: 600, color: '#374151' }
      },
      min: 0,
      max: 24,
      tickAmount: 12,
      labels: {
        formatter: (val) => Math.round(val),
        style: { fontSize: '11px', colors: '#64748b', fontFamily: 'Inter' },
      },
      axisBorder: {
        show: true,
        color: '#d1d5db',
      },
      axisTicks: {
        show: true,
        color: '#d1d5db',
      },
    },
    yaxis: {
      title: { 
        text: title,
        style: { fontSize: '12px', fontWeight: 600, color: '#374151' }
      },
      min: yAxisMin,
      max: yAxisMax,
      tickAmount: Math.max(5, Math.ceil((yAxisMax - yAxisMin) / (yAxisStep * 2))),
      labels: {
        formatter: (val) => val?.toFixed ? val.toFixed(val < 10 ? 1 : 0) : '',
        style: { fontSize: '11px', colors: '#64748b', fontFamily: 'Inter' },
      },
      axisBorder: {
        show: true,
        color: '#d1d5db',
      },
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 5,
        right: 5,
        bottom: 5,
        left: 5,
      },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '11px',
      fontFamily: 'Inter',
      markers: {
        width: 8,
        height: 8,
        radius: 0,
      },
      itemMargin: {
        horizontal: 8,
        vertical: 4,
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontSize: '12px',
        fontFamily: 'Inter',
      },
    },
    markers: {
      size: 0,
      hover: { size: 0 },
    },
    dataLabels: {
      enabled: false,
    },
  });
  
  // Always show charts, even without data - initialize with default chartData if needed
  const defaultChartData = useMemo(() => {
    // Generate age points in months (0 to 24 months)
    const agePoints = Array.from({ length: 25 }, (_, i) => i);
    const gender = patient?.gender || 'male';
    
    return {
      agePoints,
      sortedHistory: [],
      weightPercentiles: {
        p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[3] || null),
        p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[15] || null),
        p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[50] || null),
        p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[85] || null),
        p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'weight', gender)?.[97] || null),
      },
      heightPercentiles: {
        p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[3] || null),
        p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[15] || null),
        p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[50] || null),
        p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[85] || null),
        p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'height', gender)?.[97] || null),
      },
      headCircumferencePercentiles: {
        p3: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[3] || null),
        p15: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[15] || null),
        p50: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[50] || null),
        p85: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[85] || null),
        p97: agePoints.map(ageInMonths => getPercentileData(ageInMonths * 30.44, 'headCircumference', gender)?.[97] || null),
      },
    };
  }, [patient?.gender]);

  const displayChartData = chartData || defaultChartData;

  return (
    <div className="w-100 mb-2">
      <div className="stretch border-0 stretch-full">
        <div
          className="card-header d-flex align-items-center justify-content-between"
          style={{ border: "0", paddingLeft: 0, paddingTop: "0.5rem", paddingBottom: "0.5rem" }}
        >
          <h5 className="card-title mb-0 fw-bold">
            <span className="d-inline-flex align-items-center gap-2">
              <span
                className="d-inline-flex align-items-center justify-content-center rounded-3"
                style={{
                  width: 26,
                  height: 26,
                  backgroundColor: "#dbeafe",
                  color: "#3b82f6",
                }}
              >
                <FiTrendingUp size={15} />
              </span>
              <span>Growth Chart</span>
            </span>
          </h5>
        </div>

        <div
          className="card-body custom-card-action p-2"
          style={{ backgroundColor: "#f5f5f5" }}
        >


          {/* Growth Charts - Always show 3 graphs */}
          <div className="row g-2 mb-0">
            {/* Weight Chart */}
            <div className="col-md-4">
              <div className="bg-white">
                <ReactApexChart
                  type="line"
                  height={350}
                  options={getChartOptions('Weight (kg)', '#3b82f6', 2, 15, 1, ['#6366f1', '#818cf8', '#a5b4fc', '#c7d2fe', '#e0e7ff'])}
                  series={[
                    {
                      name: '3%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.weightPercentiles.p3[i],
                      })),
                      color: '#6366f1',
                    },
                    {
                      name: '15%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.weightPercentiles.p15[i],
                      })),
                      color: '#818cf8',
                    },
                    {
                      name: '50%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.weightPercentiles.p50[i],
                      })),
                      color: '#a5b4fc',
                    },
                    {
                      name: '85%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.weightPercentiles.p85[i],
                      })),
                      color: '#c7d2fe',
                    },
                    {
                      name: '97%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.weightPercentiles.p97[i],
                      })),
                      color: '#e0e7ff',
                    },
                  ]}
                />
              </div>
            </div>

            {/* Height Chart */}
            <div className="col-md-4">
              <div className="bg-white">
                <ReactApexChart
                  type="line"
                  height={350}
                  options={getChartOptions('Height (cm)', '#ef4444', 45, 95, 5, ['#dc2626', '#f87171', '#fca5a5', '#fecaca', '#fee2e2'])}
                  series={[
                    {
                      name: '3%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.heightPercentiles.p3[i],
                      })),
                      color: '#dc2626',
                    },
                    {
                      name: '15%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.heightPercentiles.p15[i],
                      })),
                      color: '#f87171',
                    },
                    {
                      name: '50%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.heightPercentiles.p50[i],
                      })),
                      color: '#fca5a5',
                    },
                    {
                      name: '85%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.heightPercentiles.p85[i],
                      })),
                      color: '#fecaca',
                    },
                    {
                      name: '97%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.heightPercentiles.p97[i],
                      })),
                      color: '#fee2e2',
                    },
                  ]}
                />
              </div>
            </div>

            {/* Head Circumference Chart */}
            <div className="col-md-4">
              <div className="bg-white">
                <ReactApexChart
                  type="line"
                  height={350}
                  options={getChartOptions('Head Circumference (cm)', '#22c55e', 31, 52, 1, ['#16a34a', '#4ade80', '#86efac', '#bbf7d0', '#dcfce7'])}
                  series={[
                    {
                      name: '3%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.headCircumferencePercentiles.p3[i],
                      })),
                      color: '#16a34a',
                    },
                    {
                      name: '15%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.headCircumferencePercentiles.p15[i],
                      })),
                      color: '#4ade80',
                    },
                    {
                      name: '50%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.headCircumferencePercentiles.p50[i],
                      })),
                      color: '#86efac',
                    },
                    {
                      name: '85%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.headCircumferencePercentiles.p85[i],
                      })),
                      color: '#bbf7d0',
                    },
                    {
                      name: '97%',
                      data: displayChartData.agePoints.map((age, i) => ({
                        x: age,
                        y: displayChartData.headCircumferencePercentiles.p97[i],
                      })),
                      color: '#dcfce7',
                    },
                  ]}
                />
              </div>
            </div>
          </div>

          {/* Growth History Table */}
          {growthHistory.length > 0 && (
            <div className="bg-white rounded border p-3" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <h6 className="mb-3 fw-bold">Patient History</h6>
              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0" style={{ fontSize: '0.85rem' }}>
                  <thead style={{ backgroundColor: '#fafbfc' }}>
                    <tr>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>Date</th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Age<br />
                        <small style={{ fontWeight: 400, fontSize: '0.75rem', color: '#6b7280' }}>(in days)</small>
                      </th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Age<br />
                        <small style={{ fontWeight: 400, fontSize: '0.75rem', color: '#6b7280' }}>(as y+m+d)</small>
                      </th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Weight (kg)
                      </th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Weight<br />
                        <small style={{ fontWeight: 400, fontSize: '0.75rem', color: '#6b7280' }}>(percentile*)</small>
                      </th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Height (cm)
                      </th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Height<br />
                        <small style={{ fontWeight: 400, fontSize: '0.75rem', color: '#6b7280' }}>(percentile*)</small>
                      </th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Head Circumference (cm)
                      </th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>
                        Head Circumference<br />
                        <small style={{ fontWeight: 400, fontSize: '0.75rem', color: '#6b7280' }}>(percentile*)</small>
                      </th>
                      <th style={{ border: '1px solid #ecedf4', padding: '10px', fontWeight: 600, fontSize: '0.9rem' }}>Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...growthHistory].sort((a, b) => new Date(a.date) - new Date(b.date)).map((record, index) => (
                      <tr key={index}>
                        <td style={{ border: '1px solid #ecedf4', padding: '10px', backgroundColor: '#fff' }}>{record.date}</td>
                        <td style={{ border: '1px solid #ecedf4', padding: '10px', backgroundColor: '#fff' }}>
                          {record.ageInDays}
                        </td>
                        <td style={{ border: '1px solid #ecedf4', padding: '10px', backgroundColor: '#fff' }}>
                          {record.ageFormatted}
                        </td>
                        <td style={{ border: '1px solid #ecedf4', padding: '10px', backgroundColor: '#fff' }}>
                          {record.weight?.toFixed ? record.weight.toFixed(2) : record.weight}
                        </td>
                        <td style={{ 
                          border: '1px solid #ecedf4', 
                          padding: '10px', 
                          backgroundColor: record.weightPercentile ? '#dbeafe' : '#fff',
                          color: record.weightPercentile ? '#1e40af' : '#000',
                          fontWeight: record.weightPercentile ? 600 : 400
                        }}>
                          {record.weightPercentile ? `${record.weightPercentile}%` : '-'}
                        </td>
                        <td style={{ border: '1px solid #ecedf4', padding: '10px', backgroundColor: '#fff' }}>
                          {record.height?.toFixed ? record.height.toFixed(2) : record.height}
                        </td>
                        <td style={{ 
                          border: '1px solid #ecedf4', 
                          padding: '10px', 
                          backgroundColor: record.heightPercentile ? '#fee2e2' : '#fff',
                          color: record.heightPercentile ? '#991b1b' : '#000',
                          fontWeight: record.heightPercentile ? 600 : 400
                        }}>
                          {record.heightPercentile ? `${record.heightPercentile}%` : '-'}
                        </td>
                        <td style={{ border: '1px solid #ecedf4', padding: '10px', backgroundColor: '#fff' }}>
                          {record.headCircumference ? (record.headCircumference?.toFixed ? record.headCircumference.toFixed(2) : record.headCircumference) : '-'}
                        </td>
                        <td style={{ 
                          border: '1px solid #ecedf4', 
                          padding: '10px', 
                          backgroundColor: record.headCircumferencePercentile ? '#dcfce7' : '#fff',
                          color: record.headCircumferencePercentile ? '#166534' : '#000',
                          fontWeight: record.headCircumferencePercentile ? 600 : 400
                        }}>
                          {record.headCircumferencePercentile ? `${record.headCircumferencePercentile}%` : '-'}
                        </td>
                        <td style={{ border: '1px solid #ecedf4', padding: '10px', backgroundColor: '#fff', fontSize: '0.8rem', color: '#6b7280' }}>
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-3">
                <small className="text-muted" style={{ fontSize: '0.75rem' }}>*Percentiles based on WHO growth standards</small>
              </div>
            </div>
          )}

          {growthHistory.length === 0 && !height && !weight && !age && (
            <div className="text-center text-muted small p-3 bg-white rounded border">
              Enter height, weight, and age to start tracking growth. Historical data will appear here.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GrowthChart;