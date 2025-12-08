// ProductAddForm.jsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';
import { Camera } from 'lucide-react';
import { styled } from '@mui/material/styles';
import { createProduct } from '../Apis/productApi';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const ImagePreview = styled('img')({
  maxWidth: '240px',
  maxHeight: '240px',
  objectFit: 'cover',
  borderRadius: '12px',
  border: '2px solid #e5e7eb',
  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
});

const initialFormState = {
  name: '',
  slug: '',
  category: '',
  image: '',
  price: '',
  unit: '',
  countInStock: '0',
  isAvailable: true,
  description: '',
};

const validateForm = (formData, imageFile) => {
  const errors = {};
  if (!formData.name.trim()) errors.name = 'Product name is required';
  if (!formData.slug.trim()) errors.slug = 'Slug is required';
  if (!formData.category) errors.category = 'Category is required';
  if (!imageFile && !formData.image) errors.image = 'Product image is required';
  if (!formData.price || Number(formData.price) <= 0) errors.price = 'Valid price is required';
  if (!formData.unit) errors.unit = 'Unit is required';
  if (formData.countInStock < 0) errors.countInStock = 'Stock cannot be negative';
  return errors;
};

const ProductAddForm = () => {
  const [formData, setFormData] = useState(initialFormState);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    if (name === 'name') {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrors((prev) => ({ ...prev, image: 'Only JPEG, PNG, GIF, WebP allowed' }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Image must be < 5MB' }));
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setFormData((prev) => ({ ...prev, image: file.name }));
    if (errors.image) setErrors((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData, imageFile);
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = key === 'price' || key === 'countInStock' ? Number(formData[key]) : formData[key];
      submitData.append(key, val);
    });
    if (imageFile) submitData.append('productImage', imageFile);

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await createProduct(submitData);
      setSuccessMessage('Product added successfully!');
      resetForm();
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to add product.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setImageFile(null);
    setImagePreview('');
    setErrors({});
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const categories = [
    { value: 'vegetable', label: 'Vegetable' },
    { value: 'fruit', label: 'Fruit' },
    { value: 'staple', label: 'Staple' },
    { value: 'herb', label: 'Herb' },
    { value: 'tuber', label: 'Tuber' },
    { value: 'other', label: 'Other' },
  ];

  const units = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'piece', label: 'Piece' },
    { value: 'pieces', label: 'Pieces' },
    { value: 'bunch', label: 'Bunch' },
    { value: 'bag', label: 'Bag' },
    { value: 'pack', label: 'Pack' },
    { value: 'basket', label: 'Basket' },
    { value: 'olonka', label: 'Olonka' },
  ];

  return (
    <Box className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Paper
          elevation={0}
          className="bg-white/95 backdrop-blur-sm shadow-xl rounded-2xl overflow-hidden border border-gray-100"
        >
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <Typography variant="h4" className="text-white font-bold">
              Add New Product
            </Typography>
          </div>

          <div className="p-6 md:p-10">
            {successMessage && (
              <Alert severity="success" className="mb-6 animate-fade-in">
                {successMessage}
              </Alert>
            )}
            {errorMessage && (
              <Alert severity="error" className="mb-6 animate-fade-in">
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Grid container spacing={{ xs: 3, md: 4 }}>
                {/* Row 1 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Product Name *"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={loading}
                    className="drop-shadow-sm"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Slug *"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    error={!!errors.slug}
                    helperText={errors.slug || 'Auto-generated from name'}
                    disabled={loading}
                  />
                </Grid>

                {/* Row 2 */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.category}>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      label="Category *"
                      disabled={loading}
                    >
                      <MenuItem value=""><em>Select Category</em></MenuItem>
                      {categories.map((c) => (
                        <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>
                      ))}
                    </Select>
                    {errors.category && (
                      <Typography variant="caption" color="error" className="mt-1">
                        {errors.category}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth error={!!errors.unit}>
                    <InputLabel>Unit *</InputLabel>
                    <Select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      label="Unit *"
                      disabled={loading}
                    >
                      <MenuItem value=""><em>Select Unit</em></MenuItem>
                      {units.map((u) => (
                        <MenuItem key={u.value} value={u.value}>{u.label}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Row 3 */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Price *"
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                    error={!!errors.price}
                    helperText={errors.price}
                    disabled={loading}
                    InputProps={{ startAdornment: <span className="mr-2 text-gray-600">$</span> }}
                    inputProps={{ min: 0, step: '0.01' }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Stock Quantity"
                    name="countInStock"
                    type="number"
                    value={formData.countInStock}
                    onChange={handleInputChange}
                    error={!!errors.countInStock}
                    helperText={errors.countInStock}
                    disabled={loading}
                    inputProps={{ min: 0 }}
                  />
                </Grid>

                {/* Image Upload */}
                <Grid item xs={12}>
                  <Stack spacing={3}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<Camera className="w-5 h-5" />}
                      className="w-full sm:w-auto border-2 border-dashed border-green-400 text-green-700 hover:bg-green-50"
                      disabled={loading}
                    >
                      Upload Product Image *
                      <VisuallyHiddenInput type="file" accept="image/*" onChange={handleImageChange} />
                    </Button>

                    {errors.image && (
                      <Typography color="error" variant="body2">
                        {errors.image}
                      </Typography>
                    )}

                    {imagePreview && (
                      <div className="flex flex-col items-start">
                        <Typography variant="subtitle2" className="text-gray-700 mb-2">
                          Preview:
                        </Typography>
                        <ImagePreview src={imagePreview} alt="Preview" />
                        <Typography variant="caption" className="text-gray-500 mt-1">
                          {imageFile?.name}
                        </Typography>
                      </div>
                    )}
                  </Stack>
                </Grid>

                {/* Availability & Description */}
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        name="isAvailable"
                        checked={formData.isAvailable}
                        onChange={handleInputChange}
                        disabled={loading}
                        color="success"
                      />
                    }
                    label={<span className="text-gray-700 font-medium">Product is available for sale</span>}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description (optional)"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    multiline
                    rows={4}
                    disabled={loading}
                    placeholder="Write a detailed description..."
                  />
                </Grid>

                {/* Buttons */}
                <Grid item xs={12}>
                  <div className="flex flex-col sm:flex-row gap-4 justify-end mt-6">
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={resetForm}
                      disabled={loading}
                      className="min-w-[140px]"
                    >
                      Reset
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 min-w-[180px]"
                    >
                      {loading ? <CircularProgress size={26} color="inherit" /> : 'Add Product'}
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </form>
          </div>
        </Paper>
      </div>
    </Box>
  );
};

export default ProductAddForm;