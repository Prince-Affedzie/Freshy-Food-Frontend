// PackageAddForm.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Paper,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Stack,
  IconButton,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { Camera, Plus, Trash2, Search, ShoppingBasket } from 'lucide-react';
import { styled } from '@mui/material/styles';
import {createPackage} from '../Apis/packageApi'; // Your API instance
import {searchProducts} from '../Apis/productApi'
import AdminSidebar from '../Components/AdminComponents/adminSidebar';


// Styled components
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
  maxWidth: '300px',
  maxHeight: '200px',
  objectFit: 'cover',
  borderRadius: '8px',
  border: '1px solid #ddd',
});

// Product search component
// Product search component
const ProductSearch = ({ onSelectProduct, excludedProductIds = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);

  const searchProduct = async () => {
    if (!searchTerm.trim()) {
      setProducts([]);
      setOpen(false);
      return;
    }
    
    setLoading(true);
    try {
      const response = await searchProducts(searchTerm);
      console.log("I'm working")
      // Filter out products already added
      const filteredProducts = response.data.suggestions.filter(
        product => !excludedProductIds.includes(product._id)
      );
      setProducts(filteredProducts);
      setOpen(true);
    } catch (error) {
      console.error('Error searching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle manual search button click
  const handleSearchClick = () => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(null);
    }
    searchProduct();
  };

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // If input is cleared, close dropdown immediately
    if (!value.trim()) {
      setProducts([]);
      setOpen(false);
      return;
    }
    
    // Set a new timeout for debounced search
    const timeout = setTimeout(() => {
      searchProduct();
    }, 300); // 300ms debounce delay
    
    setSearchTimeout(timeout);
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <Box sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        label="Search Products"
        value={searchTerm}
        onChange={handleInputChange}
        InputProps={{
          endAdornment: (
            <IconButton 
              onClick={handleSearchClick}
              disabled={loading}
              edge="end"
            >
              {loading ? <CircularProgress size={20} /> : <Search />}
            </IconButton>
          )
        }}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchClick();
          }
        }}
        placeholder="Search by product name..."
      />
      
      {loading && (
        <Box sx={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000 }}>
          <Paper sx={{ p: 2 }}>
            <CircularProgress size={20} />
          </Paper>
        </Box>
      )}
      
      {open && products.length > 0 && !loading && (
        <Paper sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          maxHeight: 300,
          overflow: 'auto',
          mt: 1
        }}>
          {products.map(product => (
            <MenuItem
              key={product._id}
              onClick={() => {
                onSelectProduct(product);
                setSearchTerm('');
                setProducts([]);
                setOpen(false);
              }}
              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
            >
              <Box sx={{ width: 40, height: 40 }}>
                <img
                  src={product.image}
                  alt={product.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
                />
              </Box>
              <Box>
                <Typography variant="body1">{product.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  ₵{product.price} / {product.unit}
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Paper>
      )}
      
      {open && products.length === 0 && !loading && searchTerm.trim() && (
        <Paper sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          p: 2,
          mt: 1
        }}>
          <Typography variant="body2" color="text.secondary">
            No products found matching "{searchTerm}"
          </Typography>
        </Paper>
      )}
    </Box>
  );
};
// Product item component
const ProductItem = ({ product, quantity, onUpdateQuantity, onRemove, isSwapOption = false }) => {
  return (
    <Card variant="outlined" sx={{ mb: 1 }}>
      <CardContent>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <img
              src={product.image}
              alt={product.name}
              style={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 4 }}
            />
            <Box>
              <Typography variant="body1">{product.name}</Typography>
              <Typography variant="caption" color="text.secondary">
                {product.category} • ₵{product.price} / {product.unit}
              </Typography>
            </Box>
          </Stack>
          
          <Stack direction="row" alignItems="center" spacing={2}>
            <TextField
              size="small"
              type="number"
              value={quantity}
              onChange={(e) => onUpdateQuantity(product._id, parseInt(e.target.value) || 1)}
              inputProps={{ min: 1 }}
              sx={{ width: 80 }}
              label="Qty"
            />
            <IconButton
              size="small"
              color="error"
              onClick={() => onRemove(product._id)}
            >
              <Trash2 />
            </IconButton>
          </Stack>
        </Stack>
        
        <Box sx={{ mt: 1 }}>
          <Chip
            size="small"
            label={`Value: ₵${(product.price * quantity).toFixed(2)}`}
            color="primary"
            variant="outlined"
          />
          {isSwapOption && (
            <Chip
              size="small"
              label="Swap Option"
              color="secondary"
              variant="outlined"
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Main Package Add Form Component
const PackageAddForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [defaultItems, setDefaultItems] = useState([]);
  const [swapOptions, setSwapOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [estimatedValue, setEstimatedValue] = useState(0);

  // Calculate estimated value when default items change
  useEffect(() => {
    const total = defaultItems.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
    setEstimatedValue(total);
  }, [defaultItems]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrorMessage('Please upload a valid image (JPEG, PNG, GIF, WebP)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setErrorMessage('');
    }
  };

  // Add product to default items
  const addDefaultItem = (product) => {
    // Check if product already exists in default items
    if (defaultItems.some(item => item.product._id === product._id)) {
      setErrorMessage('This product is already in default items');
      return;
    }

    // Check if product exists in swap options
    if (swapOptions.some(item => item.product._id === product._id)) {
      setErrorMessage('This product is already in swap options');
      return;
    }

    setDefaultItems(prev => [...prev, {
      product,
      quantity: 1
    }]);
  };

  // Add product to swap options
  const addSwapOption = (product) => {
    // Check if product already exists in swap options
    if (swapOptions.some(item => item.product._id === product._id)) {
      setErrorMessage('This product is already in swap options');
      return;
    }

    // Check if product exists in default items
    if (defaultItems.some(item => item.product._id === product._id)) {
      setErrorMessage('This product is already in default items');
      return;
    }

    setSwapOptions(prev => [...prev, {
      product,
      quantity: 1
    }]);
  };

  // Update product quantity
  const updateQuantity = (productId, quantity, isSwapOption = false) => {
    if (isSwapOption) {
      setSwapOptions(prev => prev.map(item => 
        item.product._id === productId 
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      ));
    } else {
      setDefaultItems(prev => prev.map(item => 
        item.product._id === productId 
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      ));
    }
  };

  // Remove product
  const removeProduct = (productId, isSwapOption = false) => {
    if (isSwapOption) {
      setSwapOptions(prev => prev.filter(item => item.product._id !== productId));
    } else {
      setDefaultItems(prev => prev.filter(item => item.product._id !== productId));
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.name.trim()) {
      setErrorMessage('Package name is required');
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Description is required');
      return false;
    }
    if (!formData.basePrice || parseFloat(formData.basePrice) <= 0) {
      setErrorMessage('Valid base price is required');
      return false;
    }
    if (!imageFile) {
      setErrorMessage('Package image is required');
      return false;
    }
    if (defaultItems.length === 0) {
      setErrorMessage('At least one default item is required');
      return false;
    }
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Prepare form data
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('basePrice', parseFloat(formData.basePrice));
    
    // Add default items
    const defaultItemsData = defaultItems.map(item => ({
      product: item.product._id,
      quantity: item.quantity
    }));
    submitData.append('defaultItems', JSON.stringify(defaultItemsData));
    
    // Add swap options if any
    if (swapOptions.length > 0) {
      const swapOptionsData = swapOptions.map(item => ({
        product: item.product._id,
        quantity: item.quantity
      }));
      submitData.append('swapOptions', JSON.stringify(swapOptionsData));
    }
    
    // Add image
    if (imageFile) {
      submitData.append('packageImage', imageFile);
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await createPackage(submitData)
      setSuccessMessage('Package created successfully!');
      resetForm();
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      
    } catch (error) {
      console.error('Error creating package:', error);
      setErrorMessage(
        error.response?.data?.message || 
        'Failed to create package. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
    });
    setImageFile(null);
    setImagePreview('');
    setDefaultItems([]);
    setSwapOptions([]);
    setEstimatedValue(0);
    setErrorMessage('');
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShoppingBasket color="primary" />
          Create New Basket Package
        </Typography>

        {/* Success/Error Messages */}
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        {errorMessage && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Package Name & Image */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Package Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={loading}
                placeholder="e.g., Weekly Vegetable Basket"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<Camera />}
                  disabled={loading}
                  fullWidth
                  sx={{ height: 56 }}
                >
                  Upload Package Image *
                  <VisuallyHiddenInput 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                
                {imagePreview && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Image Preview:
                    </Typography>
                    <ImagePreview src={imagePreview} alt="Package preview" />
                  </Box>
                )}
              </Box>
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                disabled={loading}
                multiline
                rows={3}
                placeholder="Describe what's included in this package..."
              />
            </Grid>

            {/* Base Price */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Base Price (₵) *"
                name="basePrice"
                type="number"
                value={formData.basePrice}
                onChange={handleInputChange}
                disabled={loading}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>₵</Typography>
                }}
                inputProps={{ min: 0, step: "0.01" }}
              />
            </Grid>

            {/* Estimated Value */}
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estimated Value
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₵{estimatedValue.toFixed(2)}
                  </Typography>
                  {formData.basePrice && (
                    <Typography variant="caption" color={parseFloat(formData.basePrice) > estimatedValue * 1.5 ? 'error' : 'text.secondary'}>
                      {parseFloat(formData.basePrice) > estimatedValue * 1.5
                        ? 'Warning: Price is significantly higher than estimated value'
                        : `Price to Value Ratio: ${(parseFloat(formData.basePrice) / estimatedValue * 100).toFixed(0)}%`}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Divider */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Package Contents" />
              </Divider>
            </Grid>

            {/* Default Items Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Default Items *
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {defaultItems.length} item(s)
                </Typography>
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <ProductSearch
                  onSelectProduct={addDefaultItem}
                  excludedProductIds={[
                    ...defaultItems.map(item => item.product._id),
                    ...swapOptions.map(item => item.product._id)
                  ]}
                />
              </Box>

              {/* Default Items List */}
              {defaultItems.length === 0 ? (
                <Alert severity="info">
                  Add at least one product as default item
                </Alert>
              ) : (
                <Box>
                  {defaultItems.map((item) => (
                    <ProductItem
                      key={item.product._id}
                      product={item.product}
                      quantity={item.quantity}
                      onUpdateQuantity={(id, qty) => updateQuantity(id, qty, false)}
                      onRemove={(id) => removeProduct(id, false)}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {/* Swap Options Section */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Swap Options
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                  {swapOptions.length} item(s)
                </Typography>
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <ProductSearch
                  onSelectProduct={addSwapOption}
                  excludedProductIds={[
                    ...defaultItems.map(item => item.product._id),
                    ...swapOptions.map(item => item.product._id)
                  ]}
                />
                <Typography variant="caption" color="text.secondary">
                  Optional: Products that customers can swap with default items
                </Typography>
              </Box>

              {/* Swap Options List */}
              {swapOptions.length === 0 ? (
                <Alert severity="info">
                  No swap options added (optional)
                </Alert>
              ) : (
                <Box>
                  {swapOptions.map((item) => (
                    <ProductItem
                      key={item.product._id}
                      product={item.product}
                      quantity={item.quantity}
                      onUpdateQuantity={(id, qty) => updateQuantity(id, qty, true)}
                      onRemove={(id) => removeProduct(id, true)}
                      isSwapOption={true}
                    />
                  ))}
                </Box>
              )}
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12}>
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={resetForm}
                  disabled={loading}
                  startIcon={<Trash2 />}
                >
                  Clear All
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{ minWidth: 150 }}
                  startIcon={loading ? <CircularProgress size={20} /> : <Plus />}
                >
                  {loading ? 'Creating...' : 'Create Package'}
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default PackageAddForm;