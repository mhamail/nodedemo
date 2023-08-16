const Category = require('../models/category')
const slugify = require('slugify')
const { errorHandler2, errorHandler, errorCode } = require('../helpers/errorHandler')


// exports.create = (req, res) => {
//     const { name } = req.body;
//     const slug = slugify(name).toLowerCase();

//     const category = new Category({ name, slug });

//     category.save((err, data) => {
//         if (err) {
//             return err.code ?
//                 errorCode(res, 400, errorHandler2(err))
//                 :
//                 errorCode(res, 400, errorHandler(err))
//         };
//         res.json(data)
//     });
// }

exports.create = async (req, res) => {
    const { name, parentId, bossId } = req.body;
    const slug = slugify(name).toLowerCase();

    const catObj = { name, slug }
    if (parentId) {
        let relate = []
        // relate.push(parentId)
        const category = await Category.findOne({ _id: parentId })

        if (category.relate) {
            relate = [...relate, ...category.relate]
        }
        catObj.relate = relate
        catObj.parentId = parentId
    }
    if (bossId) {
        catObj.bossId = bossId
    }

    const category = new Category(catObj);
    category.relate = [...category.relate, category._id.toString()]

    category.save((err, data) => {
        if (err) {
            return err.code ?
                errorCode(res, 400, errorHandler2(err))
                :
                errorCode(res, 400, errorHandler(err))
        };
        res.json(data)
    });
}
const setCategories = (categories, parentId = null) => {
    const categoryList = [];
    let category;
    if (parentId == null) {
        category = categories.filter(cat => cat.parentId == undefined)
    } else {
        category = categories.filter(cat => cat.parentId == parentId)
    }
    for (let cate of category) {
        categoryList.push({
            _id: cate._id,
            name: cate.name,
            slug: cate.slug,
            bossId: cate.bossId,
            sub: setCategories(categories, cate._id)
        })
    }
    return categoryList
}

exports.list = (req, res) => {
    Category.find({}).exec((err, categories) => {
        if (err) {
            return errorCode(res, 400, "category not found")
        }
        const catAll = setCategories(categories)
        res.json(catAll)

    })
}

exports.remove = (req, res) => {
    const _id = req.params._id
    Category.deleteOne({ _id }).exec((err, category) => {
        if (err) {
            return errorCode(res, 400, errorHandler2(err))
        }
        res.json({ message: 'Category deleted successfully' })
    })
}

//hint for remove many
exports.removeMany = (req, res) => {
    const slug = req.slug
    Category.findOne({ slug }).exec((err, category) => {
        if (err) {
            return errorCode(res, 400, errorHandler2(err))
        }
        let catId = category._id.toString()
        if (category) {
            Category.deleteMany({ relate: { $in: catId } }).exec((err, subs) => {
                if (err) {
                    return console.log(err)
                }
                console.log(subs)
            })
        }

        Category.deleteOne({ slug }).exec((err, category) => {
            if (err) {
                return errorCode(res, 400, "delete not done")
            }
            res.json({ message: 'Category deleted successfully' })
        })
    })
}

