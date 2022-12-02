import * as React from "react";
import PropTypes from "prop-types";
import { alpha } from "@mui/material/styles";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Typography,
    Paper,
    Checkbox,
    IconButton,
    Tooltip,
    Modal,
    Button,
    TextField,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { visuallyHidden } from "@mui/utils";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import EditIcon from "@mui/icons-material/Edit";
import { AddCircleRounded } from "@mui/icons-material";

const EnhancedTable = (props) => {
    const [order, setOrder] = React.useState("asc");
    const [orderBy, setOrderBy] = React.useState("calories");
    const [selected, setSelected] = React.useState([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // const {
    //     control,
    //     handleSubmit,
    //     setValue,
    //     formState: { isValid, isDirty, errors },
    // } = useForm({
    //     defaultValues: {
    //         id: "",
    //         name: "",
    //     },
    // });

    const descendingComparator = (a, b, orderBy) => {
        if (b[orderBy] < a[orderBy]) {
            return -1;
        }
        if (b[orderBy] > a[orderBy]) {
            return 1;
        }
        return 0;
    };

    const getComparator = (order, orderBy) => {
        return order === "desc"
            ? (a, b) => descendingComparator(a, b, orderBy)
            : (a, b) => -descendingComparator(a, b, orderBy);
    };

    const stableSort = (array, comparator) => {
        const stabilizedThis = array.map((el, index) => [el, index]);
        stabilizedThis.sort((a, b) => {
            const order = comparator(a[0], b[0]);
            if (order !== 0) {
                return order;
            }
            return a[1] - b[1];
        });
        return stabilizedThis.map((el) => el[0]);
    };

    const headCells = props.headCells;

    const EnhancedTableHead = (props) => {
        const {
            onSelectAllClick,
            order,
            orderBy,
            numSelected,
            rowCount,
            onRequestSort,
        } = props;
        const createSortHandler = (property) => (event) => {
            onRequestSort(event, property);
        };
        return (
            <TableHead>
                <TableRow>
                    <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            indeterminate={
                                numSelected > 0 && numSelected < rowCount
                            }
                            checked={rowCount > 0 && numSelected === rowCount}
                            onChange={onSelectAllClick}
                            inputProps={{
                                "aria-label": "select all desserts",
                            }}
                        />
                    </TableCell>
                    {headCells.map((headCell) => (
                        <TableCell
                            key={headCell.id}
                            align={headCell.numeric ? "right" : "left"}
                            padding={
                                headCell.disablePadding ? "none" : "normal"
                            }
                            sortDirection={
                                orderBy === headCell.id ? order : false
                            }
                        >
                            <TableSortLabel
                                active={orderBy === headCell.id}
                                direction={
                                    orderBy === headCell.id ? order : "asc"
                                }
                                onClick={() => createSortHandler(headCell.id)}
                            >
                                {headCell.label}
                                {orderBy === headCell.id ? (
                                    <Box component="span" sx={visuallyHidden}>
                                        {order === "desc"
                                            ? "sorted descending"
                                            : "sorted ascending"}
                                    </Box>
                                ) : null}
                            </TableSortLabel>
                        </TableCell>
                    ))}
                    <TableCell padding="checkbox"></TableCell>
                </TableRow>
            </TableHead>
        );
    };

    EnhancedTableHead.propTypes = {
        numSelected: PropTypes.number.isRequired,
        onRequestSort: PropTypes.func.isRequired,
        onSelectAllClick: PropTypes.func.isRequired,
        order: PropTypes.oneOf(["asc", "desc"]).isRequired,
        orderBy: PropTypes.string.isRequired,
        rowCount: PropTypes.number.isRequired,
    };

    const EnhancedTableToolbar = (props) => {
        console.log(props);
        const { numSelected } = props;
        const { deleteHandler } = props.mainProps;

        return (
            <Toolbar
                sx={{
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                    ...(numSelected > 0 && {
                        bgcolor: (theme) =>
                            alpha(
                                theme.palette.primary.main,
                                theme.palette.action.activatedOpacity
                            ),
                    }),
                }}
            >
                {numSelected > 0 ? (
                    <Typography
                        sx={{ flex: "1 1 100%" }}
                        color="inherit"
                        variant="subtitle1"
                        component="div"
                    >
                        {numSelected} selecionados
                    </Typography>
                ) : (
                    <Typography
                        sx={{ flex: "1 1 100%" }}
                        variant="h6"
                        id="tableTitle"
                        component="div"
                    >
                        {props.mainTitle}
                    </Typography>
                )}
                {console.log(deleteHandler)}
                {numSelected > 0 ? (
                    <Tooltip title="Apagar">
                        <IconButton
                            color="error"
                            onClick={() => deleteHandler(selected)}
                        >
                            <DeleteIcon color="error" />
                        </IconButton>
                    </Tooltip>
                ) : null}
            </Toolbar>
        );
    };

    EnhancedTableToolbar.propTypes = {
        numSelected: PropTypes.number.isRequired,
    };

    const createTable = () => {
        props.items.forEach((item) => {
            createData(item.nome);
        });
    };

    const createData = (name) => {
        return {
            name,
        };
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = props.items.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    // const handleEdition = (event, id) => {
    //     changeModalOpen(true);
    //     setValue("id", id);
    //     const selectedValue = props.items.filter((data) => {
    //         return data.id === id;
    //     })[0];
    //     setValue("name", selectedValue.nome);
    // };

    const handleClick = (event, id, a) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }

        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const getRowsPerPageOptions = () => {
        // if (props.items.length <= 5) {
        //     return [5];
        // } else {
        return parseInt(props.items.length / 5);
        // }
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (id) => selected.indexOf(id) !== -1;

    const emptyRows =
        page > 0
            ? Math.max(0, (1 + page) * rowsPerPage - props.items.length)
            : 0;

    useEffect(() => {
        createTable();
    }, []);

    return (
        <div className="table-page">
            <Box sx={{ width: { xs: "95%", sm: "80%", md: "70%" } }}>
                <Paper sx={{ width: "100%", mb: 2 }}>
                    <EnhancedTableToolbar
                        mainTitle={props.tableMainTitle}
                        mainProps={props}
                        numSelected={selected.length}
                    />
                    <TableContainer>
                        <Table
                            sx={{ minWidth: 750 }}
                            aria-labelledby="tableTitle"
                            size="medium"
                        >
                            <EnhancedTableHead
                                numSelected={selected.length}
                                order={order}
                                orderBy={orderBy}
                                onSelectAllClick={handleSelectAllClick}
                                onRequestSort={handleRequestSort}
                                rowCount={props.items.length}
                            />
                            <TableBody>
                                {stableSort(
                                    props.items,
                                    getComparator(order, orderBy)
                                )
                                    .slice(
                                        page * rowsPerPage,
                                        page * rowsPerPage + rowsPerPage
                                    )
                                    .map((row, index) => {
                                        const isItemSelected = isSelected(
                                            row.id
                                        );
                                        const labelId = row.idServico || row.id;
                                        return (
                                            <TableRow
                                                hover
                                                role="checkbox"
                                                aria-checked={isItemSelected}
                                                tabIndex={-1}
                                                key={
                                                    row.nome +
                                                    index +
                                                    "-checkbox"
                                                }
                                                selected={isItemSelected}
                                            >
                                                <TableCell padding="checkbox">
                                                    <Checkbox
                                                        color="primary"
                                                        checked={isItemSelected}
                                                        inputProps={{
                                                            "aria-labelledby":
                                                                labelId,
                                                        }}
                                                        onClick={(event) =>
                                                            handleClick(
                                                                event,
                                                                row.id,
                                                                row.idServico
                                                            )
                                                        }
                                                    />
                                                </TableCell>
                                                {headCells.map(
                                                    (field, index) => {
                                                        const data =
                                                            Object.keys(row)[
                                                                index + 1
                                                            ];
                                                        const content =
                                                            row[data];
                                                        return (
                                                            <TableCell
                                                                align={
                                                                    field.numeric
                                                                        ? "right"
                                                                        : "left"
                                                                }
                                                                padding={
                                                                    field.disablePadding
                                                                        ? "none"
                                                                        : "normal"
                                                                }
                                                                key={
                                                                    row.nome +
                                                                    index
                                                                }
                                                                component="th"
                                                                id={labelId}
                                                                scope="row"
                                                            >
                                                                {field.dataType ===
                                                                "string" ? (
                                                                    content
                                                                ) : (
                                                                    <Checkbox
                                                                        checked={Boolean(
                                                                            content
                                                                        )}
                                                                        disabled
                                                                    ></Checkbox>
                                                                )}
                                                            </TableCell>
                                                        );
                                                    }
                                                )}
                                                <TableCell align="right">
                                                    <Tooltip
                                                        title="Editar"
                                                        color="info"
                                                    >
                                                        <IconButton
                                                            onClick={() => {
                                                                props.setModalText(
                                                                    `Editar ${props.tableMainTitle}`
                                                                );
                                                                // setModalOpen(
                                                                //     true
                                                                // );
                                                                props.handleEdition(
                                                                    labelId
                                                                );
                                                                props.changeModalOpen(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                {emptyRows > 0 && (
                                    <TableRow
                                        style={{
                                            height: 53 * emptyRows,
                                        }}
                                    >
                                        <TableCell colSpan={6} />
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        labelRowsPerPage={"Itens por página"}
                        component="div"
                        count={props.items.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </Paper>
            </Box>
            <Tooltip title="Adicionar">
                <IconButton
                    color="primary"
                    onClick={() => {
                        props.setModalText(`Adicionar ${props.tableMainTitle}`);
                        props.handleEdition();
                        props.changeModalOpen(true);
                    }}
                >
                    <AddCircleRounded
                        color="primary"
                        sx={{ fontSize: "4rem" }}
                    />
                </IconButton>
            </Tooltip>
            {/* {modalOpen ? (
                <Modal
                    keepMounted
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    aria-labelledby="keep-mounted-modal-title"
                    aria-describedby="keep-mounted-modal-description"
                >
                    <Box sx={modal}>
                        <Typography
                            sx={{ marginBottom: "20px" }}
                            id="keep-mounted-modal-title"
                            variant="h5"
                            component="h2"
                        >
                            {modalText}
                        </Typography>
                        {console.log(props.field, props.fieldState)}
                        <div className="edition-area">
                            {Object.keys(props.getValues()).map(
                                (field, index) => {
                                    return (
                                        <div key={index + "-edition"}>
                                            {props.formConfigs[index].type ===
                                            "string" ? (
                                                <div key={index + "-string"}>
                                                    <Controller
                                                        control={props.form}
                                                        rules={
                                                            props.formConfigs[
                                                                index
                                                            ].rules || null
                                                        }
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                onBlur,
                                                                value,
                                                            },
                                                        }) => (
                                                            <TextField
                                                                id={field}
                                                                label={
                                                                    props
                                                                        .formConfigs[
                                                                        index
                                                                    ].label
                                                                }
                                                                variant="standard"
                                                                maxLength={60}
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    props.setValue(
                                                                        field,
                                                                        e.target
                                                                            .value
                                                                    );
                                                                }}
                                                                defaultValue={
                                                                    props.getValues()[
                                                                        field
                                                                    ] || ""
                                                                }
                                                                // value={value}
                                                            />
                                                        )}
                                                        name={field}
                                                    ></Controller>
                                                    {props?.errors?.field && (
                                                        <span>
                                                            This field is
                                                            required
                                                        </span>
                                                    )}
                                                </div>
                                            ) : props.formConfigs[index]
                                                  .type === "checkbox group" ? (
                                                <div className="group-checkbox">
                                                    <span>
                                                        {
                                                            props.formConfigs[
                                                                index
                                                            ].label
                                                        }
                                                        :
                                                    </span>
                                                    {props.checkboxGroupItems.map(
                                                        (item) => {
                                                            return (
                                                                <div
                                                                    key={`${index} ${item.nome} checkbox group`}
                                                                >
                                                                    <Controller
                                                                        control={
                                                                            props.form
                                                                        }
                                                                        rules={
                                                                            props
                                                                                .formConfigs[
                                                                                index
                                                                            ]
                                                                                .rules ||
                                                                            null
                                                                        }
                                                                        render={({
                                                                            field: {
                                                                                onChange,
                                                                                onBlur,
                                                                            },
                                                                        }) => (
                                                                            <div className="modal-checkbox">
                                                                                <label
                                                                                    htmlFor={
                                                                                        field
                                                                                    }
                                                                                >
                                                                                    {
                                                                                        item.nome
                                                                                    }
                                                                                </label>
                                                                                <Checkbox
                                                                                    sx={{
                                                                                        padding:
                                                                                            "0 9px",
                                                                                    }}
                                                                                    checked={Boolean(
                                                                                        props.getValues()[
                                                                                            field
                                                                                        ]
                                                                                    )}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                        name={
                                                                            field
                                                                        }
                                                                    ></Controller>
                                                                    {props
                                                                        ?.errors
                                                                        ?.field && (
                                                                        <span>
                                                                            This
                                                                            field
                                                                            is
                                                                            required
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            );
                                                        }
                                                    )}
                                                </div>
                                            ) : (
                                                <div key={index + "-checkbox"}>
                                                    <Controller
                                                        control={props.form}
                                                        rules={
                                                            props.formConfigs[
                                                                index
                                                            ].rules || null
                                                        }
                                                        render={({
                                                            field: {
                                                                onChange,
                                                                onBlur,
                                                            },
                                                        }) => (
                                                            <div className="modal-checkbox">
                                                                <label
                                                                    htmlFor={
                                                                        field
                                                                    }
                                                                >
                                                                    {
                                                                        props
                                                                            .formConfigs[
                                                                            index
                                                                        ].label
                                                                    }
                                                                </label>
                                                                <Checkbox
                                                                    sx={{
                                                                        padding:
                                                                            "0 9px",
                                                                    }}
                                                                    checked={Boolean(
                                                                        props.getValues()[
                                                                            field
                                                                        ]
                                                                    )}
                                                                />
                                                            </div>
                                                        )}
                                                        name={field}
                                                    ></Controller>
                                                    {props?.errors?.field && (
                                                        <span>
                                                            This field is
                                                            required
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                }
                            )}
                        </div>

                        <div className="options-modal">
                            <Button
                                variant="contained"
                                size="medium"
                                color="success"
                                disabled={
                                    props.form.getFieldState("name") ===
                                    "invalid"
                                }
                                onClick={() => {
                                    setModalOpen(false);
                                    props.handleSubmit();
                                    // cancelReserve();
                                }}
                            >
                                {modalText.split(" ")[0] === "Editar"
                                    ? "Salvar"
                                    : "Adicionar"}
                            </Button>
                            <Button
                                variant="contained"
                                size="medium"
                                color="error"
                                onClick={() => {
                                    setModalOpen(false);
                                }}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </Box>
                </Modal>
            ) : null} */}
        </div>
    );
};

const modal = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    minWidth: 200,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
};

export default EnhancedTable;
