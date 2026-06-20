import {
  pgTable,
  uuid,
  varchar,
  integer,
  timestamp,
  pgEnum,
  boolean,
} from "drizzle-orm/pg-core";
 

export const planTypeEnum = pgEnum("plan_type", ["free", "pro"])

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),

  clerkId: varchar("clerk_id", { length: 255 })
    .notNull()
    .unique(),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  spaceCount: integer("space_count").default(0).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
})


export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  planType: planTypeEnum("plan_type").default("free").notNull(),

  activationDate: timestamp("activation_date").defaultNow().notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
})


export const spaces = pgTable("spaces", {
  id: uuid("id").primaryKey().defaultRandom(),

  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  spaceName: varchar("space_name", { length: 255 }).notNull(),


  spacePassword: varchar("space_password", { length: 255 }).notNull(),

  isActive: boolean("is_active").default(true).notNull(),

  maxSongs: integer("max_songs").default(30).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
})


export const spaceMembers = pgTable("space_members", {
  id: uuid("id").primaryKey().defaultRandom(),

  spaceId: uuid("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),

  guestName: varchar("guest_name", { length: 255 }).notNull(),

  guestUuid: varchar("guest_uuid", { length: 255 }).notNull(),

  joinedAt: timestamp("joined_at").defaultNow().notNull(),
})


export const history = pgTable("history", {
  id: uuid("id").primaryKey().defaultRandom(),

  spaceId: uuid("space_id")
    .notNull()
    .references(() => spaces.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),

  url: varchar("url", { length: 500 }).notNull(),

})