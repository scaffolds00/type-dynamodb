# type-dynamodb

**type-dynamodb** is simple but powerful dynamodb ORM that uses decorators to get the most benefits from typescript and OOP like inheritance, override methods and adding multiple  layers of decorators.

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

-----

## Installation
- first install the lib and its peerDependencies
```shell
npm i class-transformer aws-sdk type-dynamodb --save
```
- install reflect-metadata :
```shell
npm install `reflect-metadata` --save

```
- add `reflect-metadata` to the root file of your project
```typescript
import "reflect-metadata";
```
- make sure to set AWS credients in your env variables using command line or .env ...etc:
```shell
export AWS_ACCESS_KEY_ID=<AWS_ID> # macos or linux
export AWS_SECRET_ACCESS_KEY=<AWS_ACCESS_KEY>
export AWS_DEFAULT_REGION=<AWS_REGION>
```
or [here](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) for other os. 

- in typescript, you need to add the following config to your `tsconfig.json`:
```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```
-----
## Usage example with table User:
1- first we add `@DyTable` decorator and extends `BaseDyTable` to get the db functionalities. 
```typescript
@DyTable('<TableName>') // default is User
class User extends BaseDyTable{
    id: string
    name: string
    userPassword: string
    created: string
}
```
2- then we determined which fields are part of our dynamodb table by adding `@DyField`:
```typescript
@DyTable()
class User extends BaseDyTable{
    @DyField()
    id: string

    @DyField()
    name: string

    @DyField()
    userPassword: string

    @DyField()
    created: string
}
```
3- then we specify the partition key field in `@DyField` and sorting key fields if exist:
```typescript
    ...

    @DyField({isPartitionKey: true})
    id: string

    @DyField({isSortingKey: true})
    created: string
    
    ...
```
4- now we can use the db functions (`dyGet`, `dyUpdate`, `dyDelete`, `dyPut`, `dyScan`, `dyQuery`) as shown here:
```typescript
    /* using await */
    
    const user = await User.dyGet({id: "id1"})
    await user.dyUpdate({userPassword: "12345"});
    await user.dyDelete();
    // scan function
    const scannedUsers = await User.dyScan(
        {
            filter: {
                created: {range: {to:"<ISOSTRING>"}},
                name: {equal: "Amro"}
            },// note every key can have only one   filter parameter.
            limit: 50,
        }
    );
    // faster query method that uses PartitionKey(must be specified) and specify sortingKey automatically
    const users = await User.dyQuery(
        "PARTITION_KEY_VALUE",
        {
        filter: {
                created: {range: {from:"<ISOSTRING>"}},
                name: {contains: "Amro"}
            } 
        }
    );

    /* using then */
    User.dyGet({id: "user1"})
        .then((user)=> user.dyUpdate( {userPassword: "12345"}))
        .then((updatedUser)=> {
            // some other logic
            updatedUser.dyDelete();
        })

```

-----

## DyGlobalSecondaryIndex and DyLocalSecondaryIndex
- for specifying local and global secondary index, use the following decorators:
```typescript
@DyTable()
class User {
    ... 

    @DyGlobalSecondaryIndex("name_index", {isPartitionKey: true})
    @DyField()
    name: string

    @DyLocalSecondaryIndex("created_index")
    @DyField({isSortingKey: true})
    created: string
    
    ...
}
```
-  to use it specify the IndexName in the filter options:
