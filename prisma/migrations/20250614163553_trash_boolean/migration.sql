-- CreateTable
CREATE TABLE "Folder" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Folder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "dateCreated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateDeleted" TIMESTAMP(3),
    "folder_id" TEXT,
    "isTrash" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "Folder"("id") ON DELETE SET NULL ON UPDATE CASCADE;
