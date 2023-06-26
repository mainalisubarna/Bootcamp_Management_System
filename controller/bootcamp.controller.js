import cloudinary from "../config/cloudinary.config.js";
import Bootcamp from "../model/bootcamp.model.js";
import Course from "../model/course.model.js";

export const getBootcamps = async (req, res) => {
    try {

        const reqQuery = { ...req.query };

        //Fields to remove
        const removeFields = ['select', 'sort', 'page', 'limit'];

        removeFields.forEach(param => delete reqQuery[param]);

        let queryStr = JSON.stringify(reqQuery);

        queryStr = queryStr.replace(/\b(gt|gte|lt|lte|eq|ne|in)\b/, match => `$${match}`)
        queryStr = JSON.parse(queryStr);
        let appendFilterQuery = Bootcamp.find(queryStr);

        // const Models = await Model.find({ title: { $eq: 'Model 1' } });
        // const Models = await Model.find({ description: { $gt: 'Model 1' } });
        // const Models = await Model.find({ title: { $lt: 'Model 1' } });
        // const Models = await Model.find({ title: { $gte: 'Model 1' } });
        // const Models = await Model.find({ title: { $lte: 'Model 1' } });

        //select specific fields
        if (req.query.select) {
            const fields = req.query.select.split(',').join(' ');
            appendFilterQuery = appendFilterQuery.select(fields);
        }

        //sort ascending /descending
        if (req.query.sort) {
            const fields = req.query.sort.split(',').join(' ');
            appendFilterQuery = appendFilterQuery.sort(fields)
        } else {
            appendFilterQuery.sort('-createdAt');
        }

        //Pagination
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        //page -2 ->  (page-1)* limit 120
        //startIndex - page=10 limit=10 
        const skipData = (page - 1) * limit;
        //90 91-100
        // 11 * 10
        const endIndex = page * limit;
        //Previous page -> skip
        // -> 1 * 3 = 3

        appendFilterQuery = appendFilterQuery.skip(skipData).limit(limit);

        const total = await Bootcamp.countDocuments();
        const Bootcamps = await appendFilterQuery;



        const pagination = {};

        //There is no next page in last page 
        if (endIndex < total) {
            pagination.next = {
                page: page + 1,
                limit
            }
        }
        //There is no previous page in page 1.
        if (skipData > 0) {
            pagination.prev = {
                page: page - 1,
                limit
            }
        }

        if (Bootcamps.length > 0) {
            res.status(200).json({
                status: true,
                data: Bootcamps,
                totalDataFetched: Bootcamps.length,
                pagination,
                total
            });
        } else {
            res.status(400).json({
                status: false,
                message: "No Bootcamps found"
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}


export const addBootcamp = async (req, res) => {
    try {
        let uploadedFile = await cloudinary.v2.uploader.upload(req.file.path);
        const data = req.body;
        data.photo = uploadedFile.secure_url;
        data.photo_public_id = uploadedFile.public_id;
        data.user = req.user.id;

        const bootcamp = await Bootcamp.create(data);

        // const bootcamp = new Bootcamp(data);
        // await bootcamp.save()

        res.status(200).json({
            status: true,
            message: 'Bootcamp created successfully',
            data: bootcamp
        })

    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}

export const updateBootcamp = async (req, res) => {
    try {
        const { id } = req.params;
        const { isImageUploaded } = req.body;
        const data = req.body;
        const bootcamp = await Bootcamp.findById(id);
        if (!bootcamp) {
            res.status(400).json({
                status: false,
                message: 'No bootcamp found '
            })
        }
        //Check if the requested user is the owner
        if (req.user.id == bootcamp.user) {

            if (isImageUploaded === 'true') {
                await cloudinary.v2.uploader.destroy(bootcamp.photo_public_id);
                let uploadedFile = await cloudinary.v2.uploader.upload(req.file.path);
                data.photo = uploadedFile.secure_url;
                data.photo_public_id = uploadedFile.public_id;
            }

            const updatedBootcamp = await Bootcamp.findOneAndUpdate({ _id: id }, {
                $set: data
            }, {
                new: true
            })

            if (updatedBootcamp) {
                res.status(200).json({
                    status: true,
                    message: 'Bootcamp updated successfully',
                    data: updatedBootcamp
                })
            }
        } else {
            res.status(401).json({
                status: true,
                message: 'Not authorized to edit its details'
            })
        }
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        })
    }
}



// export const deleteBootcamp = async (req, res) => {
//     try {
//         const { id } = req.params;

//         const bootcamp = await Bootcamp.findById(id);

//         if (!bootcamp) {
//             return res.status(400).json({
//                 status: false,
//                 message: 'No bootcamp found '
//             })
//         }
//         if (req.user._id.toString() === bootcamp.user.toString()) {

//             const deletedBootcamp = await Bootcamp.findOneAndDelete({
//                 _id: id
//             });

//             const courses = await Course.find({ bootcamp: id });
//             // const reviews = await Review.find({ bootcamp: id });
//             if (courses.length > 0) {
//                 await Course.deleteMany({
//                     bootcamp: id
//                 });
//             }
//             // if (reviews.length > 0) {
//             //    await Review.deleteMany({
//             //       bootcamp: id
//             //    });
//             // }
//             if (deletedBootcamp) {
//                 return res.status(200).json({
//                     status: true,
//                     message: 'Bootcamp deleted successfully',
//                 })
//             }
//         } else {
//             res.status(401).json({
//                 status: true,
//                 message: 'Not authorized'
//             })
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }