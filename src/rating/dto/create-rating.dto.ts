import { IsInt, IsNotEmpty } from "class-validator";

export class CreateRatingDto {
    @IsNotEmpty()
    @IsInt()
    userId!: number;
    
    @IsNotEmpty()
    @IsInt()
    bookId!: number;
    
    @IsInt()
    @IsNotEmpty()
    score!: number;


}
