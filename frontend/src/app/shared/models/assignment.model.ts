export class Assignment {
    public id: number;
    public name: string;
    public open: boolean;

    constructor(
        id: number,
        name: string,
        open: boolean
    ) {
        this.id = id;
        this.name = name;
        this.open = open;
    }
}
