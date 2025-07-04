// backend/controllers/purchaseController.js

const { Purchase, PurchaseProduct, Product, Supplier, User } = require('../database');

exports.getOne = async (req, res) => {
  try {
    const { id } = req.params;

    const compra = await Purchase.findByPk(id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: User, as: 'user' },
        {
          model: PurchaseProduct,
          as: 'purchaseProducts',
          include: [{ model: Product }]
        }
      ]
    });

    if (!compra) {
      return res.status(404).json({ message: 'Compra não encontrada.' });
    }

    res.json(compra);
  } catch (error) {
    console.error('Erro ao buscar detalhes da compra:', error);
    res.status(500).json({ message: 'Erro ao buscar detalhes da compra.', error: error.message });
  }
};
