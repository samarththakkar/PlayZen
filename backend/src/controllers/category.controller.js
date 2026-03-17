import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Category } from "../models/category.model.js";
import slugify from "slugify";

// Get all active categories — used for filter chips on home page
const getAllCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({ isActive: true })
        .sort({ order: 1 })
        .select("name slug icon order");

    res.status(200).json(
        new ApiResponse(200, categories, "Categories fetched successfully")
    );
});

// Get single category by slug
const getCategoryBySlug = asyncHandler(async (req, res) => {
    const { slug } = req.params;

    if (!slug) throw new ApiError(400, "Slug is required");

    const category = await Category.findOne({ slug, isActive: true });
    if (!category) throw new ApiError(404, "Category not found");

    res.status(200).json(
        new ApiResponse(200, category, "Category fetched successfully")
    );
});

// Create category — admin only
const createCategory = asyncHandler(async (req, res) => {
    const { name, description, icon, order } = req.body;

    if (!name) throw new ApiError(400, "Name is required");

    const existingCategory = await Category.findOne({ name });
    if (existingCategory) throw new ApiError(409, "Category already exists");

    const slug = slugify(name, { lower: true, trim: true });

    const category = await Category.create({
        name,
        slug,
        description: description || "",
        icon: icon || "",
        order: order || 0
    });

    res.status(201).json(
        new ApiResponse(201, category, "Category created successfully")
    );
});

// Update category — admin only
const updateCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;
    const { name, description, icon, order, isActive } = req.body;

    if (!categoryId) throw new ApiError(400, "Category ID is required");

    const updateData = {};
    if (name) {
        updateData.name = name;
        updateData.slug = slugify(name, { lower: true, trim: true });
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (order !== undefined) updateData.order = order;
    if (isActive !== undefined) updateData.isActive = isActive;

    const category = await Category.findByIdAndUpdate(
        categoryId,
        { $set: updateData },
        { new: true }
    );

    if (!category) throw new ApiError(404, "Category not found");

    res.status(200).json(
        new ApiResponse(200, category, "Category updated successfully")
    );
});

// Delete category — admin only
const deleteCategory = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    if (!categoryId) throw new ApiError(400, "Category ID is required");

    const category = await Category.findByIdAndDelete(categoryId);
    if (!category) throw new ApiError(404, "Category not found");

    res.status(200).json(
        new ApiResponse(200, {}, "Category deleted successfully")
    );
});

export {
    getAllCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory
};