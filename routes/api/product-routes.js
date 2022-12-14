const router = require('express').Router();
//const { json } = require('sequelize/types');
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  Product.findAll({
    include: [
      Category,
      {
        model: Tag,
        through: ProductTag
      }
    ]
  }).then((productData) => {
    res.status(200).json(productData);
  }).catch((err) => {
    console.error(err);
    res.status(500).json(err);
  });
});

// get one product
router.get('/:id', (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  Product.findOne({
    where: {
      id: req.params.id
    },
    include: [
      Category,
      {
        model: Tag,
        through: ProductTag
      }
    ]
  }).then((productData) => {
    res.status(200).json(productData);
  }).catch((err) => {
    console.error(err);
    res.status(500).json(err);
  });
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) { // if the length of tagIds is not zero, aka if any product tags were inputted
        const productTagIdArr = req.body.tagIds.map((tag_id) => { // map the products ids to an array
          return {
            product_id: product.id, // map the products id to the productTag table
            tag_id, // map the tag id to the productTag table
          };
        });
        return ProductTag.bulkCreate(productTagIdArr); // create a new product tag table inside of tags, with our mapped array
      }
      // if no product tags were inputted, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds)) // if product tags were inputted, return tagids with a successful status
    .catch((err) => {                                             // (because if product tags exist the return statement will skip over the status.json)
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  // delete one product by its `id` value
  Product.destroy({
    where: {
      id: req.params.id
    }
  }).then((productData) => {
    console.log('deleted!');
    res.status(200).json(productData);
  }).catch((err) => {
    console.error(err);
    res.status(400).json(err);
  });
});

module.exports = router;

/*
POST AND PUT ROUTE TAG EXAMPLE
"tags": [
			{
				"id": 1,
				"tag_name": "rock music",
				"product_tag": {
					"id": 17,
					"product_id": 7,
					"tag_id": 1
				}
			},
			{
				"id": 2,
				"tag_name": "pop music",
				"product_tag": {
					"id": 18,
					"product_id": 7,
					"tag_id": 2
				}
			},
			{
				"id": 3,
				"tag_name": "blue",
				"product_tag": {
					"id": 19,
					"product_id": 7,
					"tag_id": 3
				}
			},
			{
				"id": 4,
				"tag_name": "red",
				"product_tag": {
					"id": 20,
					"product_id": 7,
					"tag_id": 4
				}
			}
		]
*/
