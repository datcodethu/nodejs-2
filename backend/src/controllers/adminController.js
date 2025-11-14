const User = require('../models/User');
const File = require('../models/fileModel');
const Folder = require('../models/folderModel');
const Workspace = require('../models/workSpake');
const RefreshToken = require('../models/RefreshToken');
const logger = require('../utils/logger');

// === Admin controllers ===

// [GET] /admin/files - list all files (admin only)
exports.getAllFiles = async (req, res) => {
	try {
		logger.info('Admin requested list of all files');

		// Populate owner and folder for better context
		const files = await File.find()
			.populate({ path: 'owner', select: 'name email' })
			.populate({ path: 'folder', select: 'name' })
			.populate({ path: 'workspace', select: 'name' })
			.lean();

		return res.status(200).json({
			success: true,
			message: 'Files retrieved successfully',
			data: files
		});
	} catch (err) {
		logger.error(`Error in getAllFiles: ${err.message}`);
		return res.status(500).json({ success: false, message: 'Internal server error', details: err.message });
	}
};

// [DELETE] /admin/files/:id - delete a file by id (admin only)
exports.deleteFileById = async (req, res) => {
	try {
		const fileId = req.params.id;
		if (!fileId) {
			logger.warn('deleteFileById: missing file id');
			return res.status(400).json({ success: false, message: 'File id is required' });
		}

		const file = await File.findById(fileId);
		if (!file) {
			logger.warn(`deleteFileById: file not found ${fileId}`);
			return res.status(404).json({ success: false, message: 'File not found' });
		}

		// TODO: if files are stored on disk/cloud, delete physical file here.
		await File.findByIdAndDelete(fileId);

		logger.info(`File deleted by admin ${req.user._id}: ${fileId}`);
		return res.status(200).json({ success: true, message: 'File deleted successfully' });
	} catch (err) {
		logger.error(`Error in deleteFileById: ${err.message}`);
		return res.status(500).json({ success: false, message: 'Internal server error', details: err.message });
	}
};

// [GET] /admin/files/status - return counts by type / visibility
exports.getFileStatusCounts = async (req, res) => {
	try {
		logger.info('Admin requested file status counts');

		const totalFiles = await File.countDocuments();
		const publicFiles = await File.countDocuments({ isPublic: true });
		const privateFiles = totalFiles - publicFiles;

		// counts by fileType
		const byType = await File.aggregate([
			{ $group: { _id: '$fileType', count: { $sum: 1 } } },
			{ $project: { fileType: '$_id', count: 1, _id: 0 } }
		]);

		return res.status(200).json({
			success: true,
			data: {
				totalFiles,
				publicFiles,
				privateFiles,
				byType
			}
		});
	} catch (err) {
		logger.error(`Error in getFileStatusCounts: ${err.message}`);
		return res.status(500).json({ success: false, message: 'Internal server error', details: err.message });
	}
};