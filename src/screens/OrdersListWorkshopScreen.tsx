
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  FormControl,
  Autocomplete,
  TextField,
  Select,
  MenuItem,
  Paper,
  List,
  ListItem,
  ListItemButton,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { db } from "../db/db";

export default function OrdersListWorkshopScreen() {
  const navigate = useNavigate();

  // Orders list name
  const [ordersListName, setOrdersListName] = useState("");

  // Command selection
  const [selectedCommand, setSelectedCommand] = useState("Move Forward 1");

  // List of commands added
  const [commands, setCommands] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Placeholder validation routine
  function VERIFY_ORDERS_LIST_CHECK() {
    const hasName = ordersListName.trim() !== "";
    const hasCommands = commands.length > 0;

    if (hasName && hasCommands) {
      return {
        status: "Orders List Valid",
        message: "Orders List Valid\n\nDon't forget to save your Orders List.",
      };
    } else {
      let errorMessages = "This Orders List cannot be Saved.\n\n";
      if (!hasName) {
        errorMessages += "Every Orders List must have a name.\n";
      }
      if (!hasCommands) {
        errorMessages += "Every Orders List must at least one command added to it.";
      }
      return {
        status: "This Orders List cannot be Saved",
        message: errorMessages,
      };
    }
  }






///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
///////////////////////////////////////
async function saveOrdersList(name, commands) {
  // Look for existing record with same name
  const existing = await db.orderLists.where("name").equals(name).first();

  if (existing) {
    // Overwrite existing record
    await db.orderLists.update(existing.id, { commands });
    return existing.id;
  } else {
    // Create new record
    return await db.orderLists.add({ name, commands });
  }
}



////////////////// POSSIBLY WORKS? /////////////////////
async function handleSelectOrderList(id) {
  setSelectedListId(id);
  setCurrentCommands([]); // clear scrollable list box

  const list = await db.orderLists.get(id);
  if (list) {
    setCurrentCommands(list.commands); // load commands in correct order
  }
}







///////////////////////////////////////
//useEffect(() => {
//  async function loadOrderListNames() {
//    const lists = await db.orderLists.toArray();   // already in DB order
//    setOrderListNames(lists.map(l => ({ id: l.id, name: l.name })));
//  }

//  setOrderListNames([]); // clear dropdown
//  loadOrderListNames();
//}, []);



  function handleValidate() {
    const result = VERIFY_ORDERS_LIST_CHECK();
    alert(result.message);
  }

  async function handleSave() {
    const result = VERIFY_ORDERS_LIST_CHECK();
    if (result.status !== "Orders List Valid") {
      alert(result.message);
      return;
    }
    try {
      await db.orderLists.put({ name: ordersListName.trim(), commands });
//	        message: "." +  name: ordersListName.trim() + "." + commands + ".";


//		errorMessages += "." +  name: ordersListName.trim() + "." + commands + ".";
//	  message: errorMessages;
      alert("Orders List Saved!");
    } catch (e: any) {
      alert("Save failed: " + (e?.message ?? e));
    }
  }

  function addCommand() {
    setCommands([...commands, selectedCommand]);
  }

  function removeCommand() {
    if (selectedIndex !== null) {
      const updated = [...commands];
      updated.splice(selectedIndex, 1);
      setCommands(updated);
      setSelectedIndex(null);
    }
  }

  const commandOptions = [
    "Move Forward 1",
    "Move Forward 2",
    "Move Forward 3",
    "Move Forward 4",
    "Move Forward 5",
    "Move Backward 1",
    "Move Backward 2",
    "Move Backward 3",
    "Turn Left",
    "Turn Right",
    "Angle Left",
    "Angle Right",
    "Move toward located Enemy",
    "Fire Master Weapon",
    "Fire Seconday Weapon",
    "Fire All",
    "Activate Targeting Map",
    "Activate Self-Destruct",
    "If Movement Blocked by Ally ...",
    "If Movement Blocked by Enemy ...",
    "If Movement Blocked by Unknown ...",
	"If Any Enemies in Range ...",
    "If Facing Off-Map ...",
    "If Your Armor is Below 500 ...",
    "If Your Armor is Below 300 ...",
    "If Your Armor is Below 100 ...",
  ];

  const renderDropdown = (label, value, setValue, options) => (
    <FormControl fullWidth sx={{ mb: 4, textAlign: "left" }}>
      <Typography sx={{ color: "white", fontWeight: "bold", mb: "4px", fontSize: "12pt" }}>
        {label}
      </Typography>
      <Select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        sx={{
          bgcolor: "white",
          fontFamily: "Courier New",
          fontSize: "12pt",
          "& .MuiSelect-select": {
            fontWeight: "bold",
            height: "24px",
            paddingTop: 0,
            paddingBottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            color: "black",
          },
          "& .MuiOutlinedInput-root": {
            height: "24px",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              bgcolor: "white",
              "& .MuiMenuItem-root": {
                fontWeight: "bold",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                color: "black",
              },
            },
          },
        }}
      >
        {options.map((opt) => (
          <MenuItem key={opt} value={opt}>
            {opt}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        bgcolor: "#111",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 4,
      }}
    >
      {/* Top Label */}
      <Typography
        variant="h3"
        sx={{
          fontFamily: "Ebrima",
          fontWeight: "bold",
          fontSize: "30pt",
          color: "white",
          mb: 4,
        }}
      >
        ORDERS LIST WORKSHOP
      </Typography>

      {/* Name of Orders List */}
      <Box sx={{ width: "40%", mb: 4 }}>
        <FormControl fullWidth sx={{ mb: 4 }}>
          <Typography sx={{ fontFamily: "Courier New", color: "white", mb: "4px", fontSize: "12pt", fontWeight: "bold" }}>
            Name of Orders List:
          </Typography>
          <Autocomplete
            value={ordersListName}
            onChange={(event, newValue) => setOrdersListName(newValue || "")}
            inputValue={ordersListName}
            onInputChange={(event, newInputValue) => setOrdersListName(newInputValue)}
            options={["Default Orders List 5", "Default Orders List 15", "Default Orders List 25"]}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                sx={{
                  bgcolor: "white",
                  "& .MuiOutlinedInput-root": {
                    height: "24px",
                    padding: 0,
                  },
                  "& .MuiInputBase-input": {
                    fontFamily: "Courier New",
                    fontSize: "12pt",
                    fontWeight: "bold",
                    color: "black",
                    paddingTop: 0,
                    paddingBottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  },
                }}
              />
            )}
            ListboxProps={{
              sx: {
                bgcolor: "white",
                color: "black",
              },
            }}
            componentsProps={{
              paper: {
                sx: {
                  bgcolor: "white",
                  color: "black",
                  "& .MuiAutocomplete-option": {
                    fontFamily: "Courier New",
                    fontWeight: "bold",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                  },
                },
              },
            }}
          />
        </FormControl>
      </Box>

      {/* Main Layout: Left controls + Right list */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: 4,
          width: "80%",
          height: "50%",
        }}
      >
        {/* Left Column */}
        <Box>
          {renderDropdown("Select Command:", selectedCommand, setSelectedCommand, commandOptions)}

          <Button
            variant="contained"
            sx={leftButtonStyle}
            onClick={addCommand}
          >
            Add Command to Orders List
          </Button>

          <Button
            variant="contained"
            sx={leftButtonStyle}
            onClick={removeCommand}
          >
            Remove Command from Orders List
          </Button>
        </Box>

        {/* Right Column: Scrollable List */}
        <Paper
          elevation={3}
          sx={{
            bgcolor: "white",
            border: "2px solid gray",
            height: "100%",
            overflowY: "scroll",
          }}
        >
          <List>
            {commands.map((cmd, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  selected={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                  sx={{
                    fontFamily: "Courier New",
                    fontSize: "12pt",
                    fontWeight: "bold",
                    color: "black",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    paddingLeft: "8px",
                    bgcolor: selectedIndex === index ? "#e0e0e0" : "white",
                  }}
                >
                  {cmd}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Bottom Buttons */}
      <Box
        sx={{
          position: "absolute",
          bottom: 30,
          width: "70%",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Button variant="contained" sx={bottomButtonStyle} onClick={handleValidate}>
          Validate Orders List
        </Button>

        <Button variant="contained" sx={bottomButtonStyle} onClick={saveOrdersList(name, commands)}>
          Save Orders List
        </Button>

        <Button
          variant="contained"
          sx={bottomButtonStyle}
          onClick={() => navigate("/navigation")}
        >
          Build Bots and Armies
        </Button>
      </Box>
    </Box>
  );
}

const leftButtonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "12pt",
  fontWeight: "bold",
  color: "white",
  width: "100%",
  mb: 2,
  "&:hover": {
    bgcolor: "#001a66",
  },
};

const bottomButtonStyle = {
  bgcolor: "darkblue",
  border: "2px solid gray",
  fontFamily: "Courier New",
  fontSize: "14pt",
  fontWeight: "bold",
  color: "white",
  width: "30%",
  "&:hover": {
    bgcolor: "#001a66",
  },
};
