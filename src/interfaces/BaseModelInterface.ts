import { ModelsInterface } from "./ModelsInterface";

export interface BaseModelInterface{
    protype?;
    associate?(models: ModelsInterface): void
}