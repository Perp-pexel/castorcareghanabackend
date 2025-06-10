export const permissions = [
    {
        role: 'user',
        actions: [
            'createUser',
            'updateUser',
            'getUser',
            'getUsers',
            'getProduct',
            'getProducts',
            'getEducation',
            'getEducations',
            'createReview',
            'updateReview',
            'deleteReview',
            'getReview',
            'getReviews',
            
        ]
    }, 

    {
        role: 'farmer',
        actions: [
            'createUser',
            'updateUser',
            'getUser',
            'getUsers',
            'createProduct',
            'updateProduct',
            'getProduct',
            'getProducts',
            'deleteProduct',
            'createEducation',
            'updateEducation',
            'deleteEducation',
            'getEducation',
            'getEducations',
            'createReview',
            'updateReview',
            'deleteReview',
            'getReview',
            'getReviews'
        ]
    },


    {
        role: 'admin',
        actions: [
            'createProduct',
            'updateProduct',
            'deleteProduct',
            'getProduct',
            'getProducts',
            'createEducation',
            'updateEducation',
            'deleteEducation',
            'getEducation',
            'getEducations',
            'createUser',
            'updateUser',
            'deleteUser',
            'getUser',
            'getUsers',
            'createReview',
            'updateReview',
            'deleteReview',
            'getReview',
            'getReviews'

        ]
    }
]