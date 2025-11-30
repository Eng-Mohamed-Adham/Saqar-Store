import { createOffer } from '../../controllers/offerController.js';
import { Offer } from '../../models/offerModel.js';
import Product from '../../models/Product.js';
import { cloudinary } from '../../config/cloudinary.js';
import User from '../../models/userModel.js';

jest.mock('../../models/offerModel.js');
jest.mock('../../models/Product.js');
jest.mock('../../models/userModel.js');
jest.mock('../../config/cloudinary.js');

jest.mock('../../config/cloudinary.js', () => ({
  cloudinary: {
    uploader: {
      upload: jest.fn().mockResolvedValue({ secure_url: 'https://mocked.image.url/image.jpg' }),
    },
  },
}));


describe('Offer Controller - createOffer', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {
        title: 'Test Offer',
        description: 'Description here',
        discount: 20,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        products: ['prod123'],
        couponCode: 'SUMMER20',
        couponFor: 'all',
        image: 'data:image/png;base64,testimage',
      },
      user: {
        _id: 'seller123',
        id: 'seller123',
        role: 'seller',
      },
      file: null,
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    cloudinary.uploader.upload.mockResolvedValue({ secure_url: 'https://image.url/test.png' });
  });

  it('should return 403 if seller is banned', async () => {
    User.findById.mockResolvedValue({ isBanned: true });

    await createOffer(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: 'You are banned from performing this action' });
  });

  it('should return 500 if one of the products is not found', async () => {
    User.findById.mockResolvedValue({ isBanned: false });
    Product.findById.mockResolvedValue(null); 

    await createOffer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Error on creating offer',
      error:'product not found',
    }));
  });

  it('should create offer successfully', async () => {
    User.findById.mockResolvedValue({ isBanned: false });
    Product.findById.mockResolvedValue({ _id: 'prod123', stock: 10 });

    Offer.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue({ _id: 'offer123', title: 'Test Offer' }),
    }));

    await createOffer(req, res);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith(
      'data:image/png;base64,testimage',
      { folder: 'offers' }
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      _id: 'offer123',
      title: 'Test Offer',
    }));
  });

  it('should return 500 if error is thrown', async () => {
    User.findById.mockRejectedValue(new Error('DB Error'));

    await createOffer(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      message: 'Error on creating offer',
      error: 'DB Error',
    }));
  });
});
