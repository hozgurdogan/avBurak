-- CreateTable
CREATE TABLE `visitors` (
    `id` VARCHAR(191) NOT NULL,
    `firstSeenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `lastSeenAt` DATETIME(3) NOT NULL,

    INDEX `visitors_firstSeenAt_idx`(`firstSeenAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `page_views` (
    `id` VARCHAR(191) NOT NULL,
    `visitorId` VARCHAR(191) NOT NULL,
    `path` VARCHAR(191) NOT NULL,
    `locale` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `page_views_visitorId_idx`(`visitorId`),
    INDEX `page_views_createdAt_idx`(`createdAt`),
    INDEX `page_views_path_idx`(`path`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `page_views` ADD CONSTRAINT `page_views_visitorId_fkey` FOREIGN KEY (`visitorId`) REFERENCES `visitors`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
