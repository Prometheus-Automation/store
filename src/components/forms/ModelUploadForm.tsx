'use client';

/**
 * Model Upload Form - Comprehensive AI model submission form
 * Handles model metadata, pricing, demo examples, and file uploads
 * Integrated with Supabase backend and form validation
 */

import React, { useState } from 'react'
// @ts-ignore
import { useForm, Controller } from 'react-hook-form'
import { useAuth } from '../../contexts/AuthContext'
import { ModelService } from '../../services/modelService'
import type { AIModelInsert } from '../../types/database'
import { 
  Upload, 
  DollarSign, 
  Tag, 
  FileText, 
  Code, 
  Globe, 
  Github,
  BookOpen,
  Zap,
  Clock,
  HardDrive,
  Target,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface ModelUploadFormData extends Omit<AIModelInsert, 'developer_id' | 'slug'> {
  demo_input: string
  demo_output: string
}

interface ModelUploadFormProps {
  onSuccess?: (modelId: string) => void
  onCancel?: () => void
}

const ModelUploadForm: React.FC<ModelUploadFormProps> = ({ onSuccess, onCancel }) => {
  const { isDeveloper } = useAuth()
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isValid },
    reset
  } = useForm<ModelUploadFormData>({
    mode: 'onChange',
    defaultValues: {
      pricing_model: 'per_call',
      price: 0,
      status: 'pending',
      is_featured: false,
      tags: []
    }
  })

  const watchedPricingModel = watch('pricing_model')

  const categories = [
    'Computer Vision',
    'Natural Language Processing',
    'Audio Processing',
    'Generative AI',
    'Recommendation Systems',
    'Time Series Analysis',
    'Reinforcement Learning',
    'Other'
  ]

  const frameworks = [
    'TensorFlow',
    'PyTorch',
    'Hugging Face',
    'OpenAI API',
    'Anthropic',
    'Cohere',
    'Stability AI',
    'Custom',
    'Other'
  ]

  const pricingModels = [
    { value: 'per_call', label: 'Per API Call', description: 'Charge per individual request' },
    { value: 'subscription', label: 'Subscription', description: 'Monthly/yearly access' },
    { value: 'one_time', label: 'One-time Purchase', description: 'Single payment for lifetime access' },
    { value: 'free', label: 'Free', description: 'No charge (for showcasing)' }
  ]

  const onSubmit = async (data: ModelUploadFormData) => {
    if (!isDeveloper) {
      toast.error('You must be a developer to upload models')
      return
    }

    setSubmitStatus('loading')
    setSubmitMessage('Uploading model...')

    try {
      // Parse demo examples
      let demo_input_example = null
      let demo_output_example = null

      if (data.demo_input) {
        try {
          demo_input_example = JSON.parse(data.demo_input)
        } catch {
          demo_input_example = data.demo_input
        }
      }

      if (data.demo_output) {
        try {
          demo_output_example = JSON.parse(data.demo_output)
        } catch {
          demo_output_example = data.demo_output
        }
      }

      // Prepare model data
      const modelData: Omit<AIModelInsert, 'developer_id'> = {
        ...data,
        slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        demo_input_example,
        demo_output_example,
        tags: Array.isArray(data.tags) ? data.tags : []
      }

      // Remove demo string fields that were only for the form
      delete (modelData as any).demo_input
      delete (modelData as any).demo_output

      const result = await ModelService.createModel(modelData)

      if (result.success && result.data) {
        setSubmitStatus('success')
        setSubmitMessage('Model uploaded successfully!')
        toast.success('Model submitted for review')
        
        setTimeout(() => {
          onSuccess?.(result.data!.id)
          reset()
          setSubmitStatus('idle')
        }, 2000)
      } else {
        throw new Error(result.error || 'Failed to upload model')
      }
    } catch (error: any) {
      setSubmitStatus('error')
      setSubmitMessage(error.message || 'Failed to upload model')
      toast.error(error.message || 'Upload failed')
      
      setTimeout(() => {
        setSubmitStatus('idle')
      }, 3000)
    }
  }

  if (!isDeveloper) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <div className="flex items-center gap-3">
          <Upload className="w-8 h-8 text-yellow-600" />
          <div>
            <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
              Developer Access Required
            </h3>
            <p className="text-yellow-700 dark:text-yellow-300 mt-1">
              You need to be a verified developer to upload AI models.
            </p>
            <button className="mt-3 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
              Apply to become a Developer
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3">
            <Upload className="w-8 h-8 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Upload AI Model
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Share your AI model with the marketplace community
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model Name *
                </label>
                <input
                  {...register('name', { 
                    required: 'Model name is required',
                    minLength: { value: 3, message: 'Name must be at least 3 characters' }
                  })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Advanced Image Classifier"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Category *
                </label>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                {...register('description', { 
                  required: 'Description is required',
                  minLength: { value: 50, message: 'Description must be at least 50 characters' }
                })}
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe your model's capabilities, use cases, and unique features..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>
          </section>

          {/* Technical Details */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Technical Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Framework
                </label>
                <select
                  {...register('framework')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select framework</option>
                  {frameworks.map((framework) => (
                    <option key={framework} value={framework}>
                      {framework}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Model Type
                </label>
                <input
                  {...register('model_type')}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., CNN, Transformer, LSTM"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <Target className="w-4 h-4" />
                  Accuracy (%)
                </label>
                <input
                  {...register('accuracy', { 
                    min: { value: 0, message: 'Accuracy must be positive' },
                    max: { value: 100, message: 'Accuracy cannot exceed 100%' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="95.5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Latency (ms)
                </label>
                <input
                  {...register('latency_ms', { 
                    min: { value: 1, message: 'Latency must be positive' }
                  })}
                  type="number"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="150"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <HardDrive className="w-4 h-4" />
                  Model Size (MB)
                </label>
                <input
                  {...register('model_size_mb', { 
                    min: { value: 0.1, message: 'Model size must be positive' }
                  })}
                  type="number"
                  step="0.1"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="25.5"
                />
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Pricing
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Pricing Model *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricingModels.map((model) => (
                    <label key={model.value} className="relative cursor-pointer">
                      <input
                        {...register('pricing_model', { required: 'Pricing model is required' })}
                        type="radio"
                        value={model.value}
                        className="sr-only peer"
                      />
                      <div className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 hover:border-gray-300 dark:hover:border-gray-500 transition-colors">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {model.label}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {model.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {watchedPricingModel !== 'free' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (USD) *
                  </label>
                  <input
                    {...register('price', { 
                      required: watchedPricingModel !== 'free' ? 'Price is required' : false,
                      min: { value: 0, message: 'Price must be positive' }
                    })}
                    type="number"
                    step="0.01"
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={
                      watchedPricingModel === 'per_call' ? '0.01' :
                      watchedPricingModel === 'subscription' ? '29.99' : '99.99'
                    }
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price.message}</p>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Links & Resources */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Links & Resources
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <Github className="w-4 h-4" />
                  GitHub Repository
                </label>
                <input
                  {...register('github_url')}
                  type="url"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  Documentation URL
                </label>
                <input
                  {...register('documentation_url')}
                  type="url"
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://docs.example.com"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-1">
                <Zap className="w-4 h-4" />
                API Endpoint
              </label>
              <input
                {...register('api_endpoint')}
                type="url"
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://api.example.com/v1/predict"
              />
            </div>
          </section>

          {/* Demo Examples */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Code className="w-5 h-5" />
              Demo Examples
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sample Input
                </label>
                <textarea
                  {...register('demo_input')}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder='{"text": "Hello world", "max_length": 100}'
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Expected Output
                </label>
                <textarea
                  {...register('demo_output')}
                  rows={4}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder='{"generated_text": "Hello world! How are you doing today?", "confidence": 0.95}'
                />
              </div>
            </div>
          </section>

          {/* Tags */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags
            </h3>
            
            <Controller
              name="tags"
              control={control}
              render={({ field }: any) => (
                <input
                  {...field}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="machine-learning, computer-vision, tensorflow (comma-separated)"
                  onChange={(e) => {
                    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    field.onChange(tags)
                  }}
                  value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                />
              )}
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add relevant tags to help users discover your model
            </p>
          </section>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            {submitStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{submitMessage}</span>
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4">
                <XCircle className="w-5 h-5" />
                <span className="font-medium">{submitMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!isValid || submitStatus === 'loading'}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitStatus === 'loading' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Submit for Review
                </>
              )}
            </button>

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 sm:flex-initial px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModelUploadForm