import Joi from 'joi'

export const validationSchema = Joi.object({
    DATABASE_URL: Joi.string().uri().required(),

    JWT_ACCESS_SECRET: Joi.string().required(),
    JWT_REFRESH_SECRET: Joi.string().required(),

    REDIS_URL: Joi.string().uri().required(),

    S3_ACCESS_KEY: Joi.string().required(),
    S3_SECRET: Joi.string().required(),
    S3_ENDPOINT: Joi.string().uri().required(),
    S3_BUCKET: Joi.string().required(),
    S3_REGION: Joi.string().required(),
})